-- QuizArena Tug of War mode: run ONCE on your existing Supabase QuizArena project.
-- Does not reset existing quizzes, games, answers, or user accounts.
-- Roll out the website files AFTER this migration succeeds.
BEGIN;
ALTER TABLE public.qa_games
  ADD COLUMN IF NOT EXISTS tug_position numeric(6,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tug_rounds jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.qa_games DROP CONSTRAINT IF EXISTS qa_games_mode_check;
ALTER TABLE public.qa_games ADD CONSTRAINT qa_games_mode_check
  CHECK (mode IN ('solo','team','paper','tug'));
create or replace function public.qa_host(qid uuid, game_mode text, teams integer default 3, roster_id uuid default null) returns uuid language plpgsql security definer set search_path='' as $$
declare q public.qa_quizzes; gid uuid; code text; item jsonb; qs jsonb; i integer; r public.qa_rosters; n integer;
begin
 if not public.qa_teacher() then raise exception 'A teacher account is required'; end if;
 select * into q from public.qa_quizzes where id=qid and owner_id=auth.uid() and not archived;
 if not found then raise exception 'Quiz not found'; end if;
 if game_mode not in ('solo','team','paper','tug') or teams not between 2 and 8 then raise exception 'Invalid game settings'; end if;
 if jsonb_array_length(q.questions)=0 then raise exception 'Add at least one question'; end if;
 for item in select value from jsonb_array_elements(q.questions) loop
  if not coalesce(length(trim(item->>'prompt'))>0 and length(trim(item->>'answer'))>0 and item->>'type' in ('mcq','tf','text') and (item->>'seconds')::int between 5 and 600 and (item->>'points')::int between 1 and 10000,false) then raise exception 'Check question text, answer, time and points'; end if;
  if item->>'type' in ('mcq','tf') and (jsonb_array_length(item->'options') not between 2 and 4 or not (item->'options' @> jsonb_build_array(item->>'answer'))) then raise exception 'Answer must match an option'; end if;
  if game_mode in ('paper','tug') and item->>'type'='text' then raise exception 'This mode supports multiple choice and true/false only'; end if;
 end loop;
 if game_mode='tug' then teams:=2; end if;
 if game_mode='paper' then
  select * into r from public.qa_rosters where id=roster_id and owner_id=auth.uid();
  if not found or jsonb_array_length(r.students)=0 then raise exception 'Choose a class roster'; end if;
 end if;
 loop
  code:=lpad((floor(random()*900000)+100000)::text,6,'0');
  begin
   insert into public.qa_games(owner_id,quiz_id,title,pin,mode,question_count,team_count) values(auth.uid(),qid,q.title,code,game_mode,jsonb_array_length(q.questions),teams) returning id into gid;
   exit;
  exception when unique_violation then end;
 end loop;
 insert into qa_private.snapshots values(gid,q.questions);
 if game_mode='paper' then
  for item in select value from jsonb_array_elements(r.students) loop
   n:=(item->>'card')::int;
   if n not between 1 and 100 then raise exception 'Card numbers must be 1–100'; end if;
   insert into public.qa_players(game_id,nickname,card) values(gid,item->>'name',n);
  end loop;
 end if;
 return gid;
end $$;


create or replace function public.qa_join(game_pin text, player_name text) returns uuid language plpgsql security definer set search_path='' as $$
declare g public.qa_games; attempts integer; cnt integer; pid uuid;
begin
 if auth.uid() is null then raise exception 'Sign in as a guest first'; end if;
 insert into qa_private.join_limits(user_id,attempts) values(auth.uid(),1) on conflict(user_id) do update set attempts=case when qa_private.join_limits.window_start<now()-interval '1 minute' then 1 else qa_private.join_limits.attempts+1 end,window_start=case when qa_private.join_limits.window_start<now()-interval '1 minute' then now() else qa_private.join_limits.window_start end returning join_limits.attempts into attempts;
 if attempts>20 then return null; end if;
 select * into g from public.qa_games where pin=trim(game_pin) for update;
 if not found then return null; end if;
 if exists(select 1 from public.qa_players where game_id=g.id and user_id=auth.uid()) then return g.id; end if;
 if g.status<>'lobby' or g.mode='paper' then return null; end if;
 if length(trim(player_name)) not between 1 and 30 then raise exception 'Use a nickname with 1–30 characters'; end if;
 select count(*) into cnt from public.qa_players where game_id=g.id;
 if cnt>=200 then raise exception 'This game is full'; end if;
 insert into public.qa_players(game_id,user_id,nickname,team) values(g.id,auth.uid(),trim(player_name),case when g.mode in ('team','tug') then cnt%g.team_count+1 end);
 return g.id;
end $$;


create or replace function public.qa_control(gid uuid, action text) returns void language plpgsql security definer set search_path='' as $$
declare g public.qa_games; qs jsonb; q jsonb; idx integer;
  left_count integer; right_count integer; left_hits integer; right_hits integer;
  pull_delta numeric; new_position numeric; kept_moves jsonb;
begin
 select * into g from public.qa_games where id=gid for update;
 if not found or g.owner_id<>auth.uid() or not public.qa_teacher() then raise exception 'Only the host can control this game'; end if;
 select questions into qs from qa_private.snapshots where game_id=gid;
 if action='start' and g.mode='tug' and (
     (select count(*) from public.qa_players where game_id=gid and team=1)=0 or
     (select count(*) from public.qa_players where game_id=gid and team=2)=0)
   then raise exception 'Wait for at least one learner on each rope team'; end if;
 if action='end' then update public.qa_games set status='finished',deadline=null,updated_at=clock_timestamp() where id=gid; return; end if;
 if g.status='finished' then raise exception 'This game has ended'; end if;
 if action='pause' and g.status='question' then
  update public.qa_games set status='paused',remaining_ms=greatest(0,extract(epoch from (deadline-clock_timestamp()))*1000)::int,deadline=null,updated_at=clock_timestamp() where id=gid;
 elsif action='resume' and g.status='paused' then
  update public.qa_games set status='question',deadline=clock_timestamp()+g.remaining_ms*interval '1 millisecond',updated_at=clock_timestamp() where id=gid;
 elsif action='reveal' and g.status in ('question','paused') then
  q:=qs->g.question_index;
  if g.mode='tug' then
    -- A point of accuracy per learner, not per head count. Equal teams have no advantage.
    select count(*) filter (where team=1),count(*) filter (where team=2)
      into left_count,right_count from public.qa_players where game_id=gid;
    select count(*) filter (where p.team=1 and a.correct), count(*) filter (where p.team=2 and a.correct)
      into left_hits,right_hits
      from qa_private.answers a join public.qa_players p on p.id=a.player_id
      where a.game_id=gid and a.question_index=g.question_index;
    pull_delta := round((coalesce(left_hits::numeric/nullif(left_count,0),0) -
                         coalesce(right_hits::numeric/nullif(right_count,0),0))*38,2);
    new_position := greatest(-100,least(100,g.tug_position+pull_delta));
    update public.qa_games set
      tug_position=new_position,
      tug_rounds=g.tug_rounds || jsonb_build_array(jsonb_build_object(
        'question',g.question_index+1,'delta',pull_delta,
        'left_correct',left_hits,'left_total',left_count,
        'right_correct',right_hits,'right_total',right_count)),
      status=case when abs(new_position)>=100 then 'finished' else 'reveal' end,
      current_question=q, deadline=null, updated_at=clock_timestamp()
      where id=gid;
  else
    update public.qa_games set status='reveal',current_question=q,deadline=null,updated_at=clock_timestamp() where id=gid;
  end if;
 elsif (action='start' and g.status='lobby') or (action='next' and g.status='reveal') or (action='skip' and g.status in ('question','paused','reveal')) or (action='repeat' and g.question_index>=0) then
  idx:=case when action='repeat' then g.question_index else g.question_index+1 end;
  if action='repeat' then
    delete from qa_private.answers where game_id=gid and question_index=idx;
    if g.mode='tug' then
      select coalesce(jsonb_agg(value), '[]'::jsonb) into kept_moves
      from jsonb_array_elements(g.tug_rounds) as tug_move(value)
      where (value->>'question')::int <> idx+1;
      update public.qa_games set tug_rounds=kept_moves,
        tug_position=greatest(-100,least(100,coalesce((select sum((value->>'delta')::numeric)
          from jsonb_array_elements(kept_moves) as t(value)),0))) where id=gid;
    end if;
  end if;
  if idx>=g.question_count then update public.qa_games set status='finished',deadline=null,updated_at=clock_timestamp() where id=gid;
  else
   q:=qs->idx;
   update public.qa_games set status='question',question_index=idx,current_question=q-'answer',deadline=clock_timestamp()+((q->>'seconds')::int)*interval '1 second',remaining_ms=null,updated_at=clock_timestamp() where id=gid;
  end if;
 else raise exception 'That action is unavailable in the current game state';
 end if;
end $$;



create or replace function public.qa_answer(gid uuid, question_no integer, response text, card_no integer default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare g public.qa_games; p public.qa_players; q jsonb; a qa_private.answers; ok boolean; pts integer; ms integer;
begin
 select * into g from public.qa_games where id=gid for update;
 if not found then raise exception 'Game not found'; end if;
 if card_no is not null then
  if g.owner_id<>auth.uid() or g.mode<>'paper' then raise exception 'Only the host can scan this game'; end if;
  select * into p from public.qa_players where game_id=gid and card=card_no;
 else select * into p from public.qa_players where game_id=gid and user_id=auth.uid(); end if;
 if p.id is null then raise exception 'Join this game first'; end if;
 if question_no<>g.question_index then raise exception 'The question has changed'; end if;
 select * into a from qa_private.answers where game_id=gid and player_id=p.id and question_index=question_no;
 if found and card_no is null then
  if g.mode='tug' and g.status in ('question','paused') then return jsonb_build_object('saved',true,'answer',a.answer); end if;
  return jsonb_build_object('correct',a.correct,'points',a.points,'answer',a.answer);
 end if;
 if g.status<>'question' or clock_timestamp()>g.deadline then raise exception 'This question is closed'; end if;
 select questions->question_no into q from qa_private.snapshots where game_id=gid;
 if length(response)>1000 then raise exception 'Answer is too long'; end if;
 ok:=lower(trim(response))=lower(trim(q->>'answer'));
 pts:=case when ok then (q->>'points')::int else 0 end;
 ms:=greatest(0,(q->>'seconds')::int*1000-extract(epoch from (g.deadline-clock_timestamp()))*1000)::int;
 insert into qa_private.answers(game_id,player_id,question_index,answer,correct,points,elapsed_ms) values(gid,p.id,question_no,response,ok,pts,ms)
 on conflict(game_id,player_id,question_index) do update set answer=excluded.answer,correct=excluded.correct,points=excluded.points,elapsed_ms=excluded.elapsed_ms,submitted_at=clock_timestamp();
 -- Never reveal correctness to the scanner until the host reveals the answer.
 if card_no is not null then return jsonb_build_object('saved',true); end if;
 if g.mode='tug' then return jsonb_build_object('saved',true,'answer',response); end if;
 return jsonb_build_object('correct',ok,'points',pts,'answer',response);
end $$;


create or replace function public.qa_state(gid uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare g public.qa_games; board jsonb; mine jsonb; total integer; received integer; scanned jsonb; distribution jsonb; correct_count integer;
begin
 if not public.qa_member(gid) then raise exception 'Join this game first'; end if;
 select * into g from public.qa_games where id=gid;
 select count(*) into total from public.qa_players where game_id=gid;
 select count(*) into received from qa_private.answers where game_id=gid and question_index=g.question_index;
 select coalesce(jsonb_agg(t order by t.score desc,t.elapsed_ms,t.nickname),'[]') into board from (
  select p.id,p.nickname,p.team,p.card,coalesce(sum(a.points) filter(where a.question_index<g.question_index or g.status in ('reveal','finished')),0) as score,
  coalesce(sum(a.elapsed_ms) filter(where a.question_index<g.question_index or g.status in ('reveal','finished')),0) as elapsed_ms,
  count(*) filter(where a.correct and (a.question_index<g.question_index or g.status in ('reveal','finished'))) as correct,
  p.user_id=auth.uid() as is_me
  from public.qa_players p left join qa_private.answers a on a.player_id=p.id where p.game_id=gid group by p.id
 )t;
 select to_jsonb(a)-'player_id'-'game_id' into mine from qa_private.answers a join public.qa_players p on p.id=a.player_id where a.game_id=gid and a.question_index=g.question_index and p.user_id=auth.uid();
 if g.mode='tug' and g.status in ('question','paused') and mine is not null then
  mine:=jsonb_build_object('answer',mine->>'answer','saved',true);
 end if;
 if g.owner_id=auth.uid() then
  select coalesce(jsonb_agg(jsonb_build_object('card',p.card,'nickname',p.nickname,'saved',a.player_id is not null,'answer',a.answer)),'[]') into scanned from public.qa_players p left join qa_private.answers a on a.player_id=p.id and a.question_index=g.question_index where p.game_id=gid;
 end if;
 if g.status in ('reveal','finished') then
  select coalesce(jsonb_agg(t),'[]') into distribution from (select answer,count(*) as responses from qa_private.answers where game_id=gid and question_index=g.question_index group by answer)t;
  select count(*) into correct_count from qa_private.answers where game_id=gid and question_index=g.question_index and correct;
 end if;
 return jsonb_build_object('distribution',distribution,'correct_count',correct_count,'game',to_jsonb(g),'players',board,'total',total,'received',received,'mine',mine,'scanned',scanned,'server_time',clock_timestamp());
end $$;


-- Preserve the original privileges; the functions remain security-definer.
REVOKE ALL ON FUNCTION public.qa_host(uuid,text,integer,uuid), public.qa_join(text,text),
  public.qa_control(uuid,text), public.qa_answer(uuid,integer,text,integer),
  public.qa_state(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.qa_host(uuid,text,integer,uuid), public.qa_join(text,text),
  public.qa_control(uuid,text), public.qa_answer(uuid,integer,text,integer),
  public.qa_state(uuid) TO authenticated;
COMMIT;
