-- QUIZARENA ANONYMOUS JOIN CONTROL
-- Run in the EXISTING QuizArena Supabase SQL editor after tug-of-war-migration.sql.
-- Existing games stay open to guest players unless the host turns guest entry off.
BEGIN;
ALTER TABLE public.qa_games ADD COLUMN IF NOT EXISTS allow_anonymous boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.qa_set_guest_access(gid uuid, enabled boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $guest_access$
DECLARE g public.qa_games;
BEGIN
  IF auth.uid() IS NULL OR NOT public.qa_teacher() THEN
    RAISE EXCEPTION 'Only a signed-in host can update guest access';
  END IF;
  SELECT * INTO g FROM public.qa_games WHERE id = gid FOR UPDATE;
  IF NOT FOUND OR g.owner_id <> auth.uid() THEN
    RAISE EXCEPTION 'Game not found or you are not its host';
  END IF;
  IF g.status <> 'lobby' THEN
    RAISE EXCEPTION 'Guest entry can only be changed in the waiting lobby';
  END IF;
  UPDATE public.qa_games SET allow_anonymous = enabled,
    updated_at = clock_timestamp() WHERE id = gid;
END;
$guest_access$;

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
 if not coalesce(g.allow_anonymous,true) and coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
  raise exception 'Anonymous entry is disabled for this game. Sign in with an existing QuizArena account.';
 end if;
 if length(trim(player_name)) not between 1 and 30 then raise exception 'Use a nickname with 1–30 characters'; end if;
 select count(*) into cnt from public.qa_players where game_id=g.id;
 if cnt>=200 then raise exception 'This game is full'; end if;
 insert into public.qa_players(game_id,user_id,nickname,team) values(g.id,auth.uid(),trim(player_name),case when g.mode in ('team','tug') then cnt%g.team_count+1 end);
 return g.id;
end $$;


REVOKE ALL ON FUNCTION public.qa_set_guest_access(uuid,boolean), public.qa_join(text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.qa_set_guest_access(uuid,boolean), public.qa_join(text,text) TO authenticated;
COMMIT;
