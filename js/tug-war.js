// QuizArena illustrated live Tug of War stage. Game scoring remains in Supabase.
const seenPositions = new Map();
export function tugOutcome(position){return position>0?'Purple Pullers':position<0?'Teal Titans':'Draw';}
export function tugStage(game,players=[]){
 const position=Math.max(-100,Math.min(100,Number(game.tug_position)||0));
 const before=seenPositions.has(game.id)?seenPositions.get(game.id):position;
 seenPositions.set(game.id,position);
 const ropeFrom=(50-before*.34).toFixed(2), ropeTo=(50-position*.34).toFixed(2);
 const left=players.filter(p=>p.team===1).length,right=players.filter(p=>p.team===2).length;
 const rounds=Array.isArray(game.tug_rounds)?game.tug_rounds:[];
 const last=rounds.length?rounds[rounds.length-1]:null;
 const finished=game.status==='finished';
 const round=game.question_index<0?'GET READY':`ROUND ${Math.min(game.question_count,game.question_index+1)} OF ${game.question_count}`;
 const label=finished?(position===0?'An epic draw!':`${tugOutcome(position)} take the victory!`):
   position>0?'Purple Pullers are leading!':position<0?'Teal Titans are leading!':'The rope is tied — every answer counts!';
 const lastAccuracy=last?`<span class="tug-round-stat">Last round: <b>${Number(last.left_correct)||0}/${Number(last.left_total)||0}</b> Purple · <b>${Number(last.right_correct)||0}/${Number(last.right_total)||0}</b> Teal</span>`:
   '<span class="tug-round-stat">The rope moves after the teacher reveals each question.</span>';
 return `<section class="tug-arena" data-tug-stage style="--rope-from:${ropeFrom}%;--rope-to:${ropeTo}%" aria-label="Tug of War arena: ${label}">
  <div class="tug-arena-top"><span class="tug-event-tag"><span class="tug-live-dot"></span> QUIZARENA LIVE</span><span class="tug-round-badge">${finished?'FINAL RESULT':round}</span></div>
  <div class="tug-scoreboard"><div class="tug-team-box team-purple"><span class="tug-team-symbol" aria-hidden="true">✦</span><div><strong>PURPLE PULLERS</strong><small>${left} player${left===1?'':'s'} ready</small></div></div><div class="tug-vs">VS</div><div class="tug-team-box team-teal"><div><strong>TEAL TITANS</strong><small>${right} player${right===1?'':'s'} ready</small></div><span class="tug-team-symbol" aria-hidden="true">✦</span></div></div>
  <div class="tug-battleground"><div class="tug-stadium-lights" aria-hidden="true"></div><div class="tug-audience" aria-hidden="true"></div><div class="tug-sparks tug-sparks-left" aria-hidden="true">✦　✧</div><div class="tug-sparks tug-sparks-right" aria-hidden="true">✧　✦</div>
    <div class="tug-floor" aria-hidden="true"></div><div class="tug-center-line" aria-hidden="true"></div><div class="tug-avatar tug-avatar-left" aria-hidden="true"><img src="assets/tug-player-purple.svg" alt=""></div><div class="tug-avatar tug-avatar-right" aria-hidden="true"><img src="assets/tug-player-teal.svg" alt=""></div>
    <div class="tug-rope-track" aria-hidden="true"><span class="tug-rope-cord"></span><span class="tug-rope-flag"><b>★</b></span><span class="tug-rope-center"></span></div><div class="tug-goal tug-goal-left">◀ PURPLE WINS</div><div class="tug-goal tug-goal-right">TEAL WINS ▶</div></div>
  <div class="tug-pull-meter"><span class="tug-meter-side purple">PURPLE</span><div class="tug-meter-track" aria-hidden="true"><div class="tug-meter-purple"></div><div class="tug-meter-teal"></div><i style="left:${ropeTo}%"></i></div><span class="tug-meter-side teal">TEAL</span></div>
  <div class="tug-commentary" role="status"><strong>${label}</strong>${lastAccuracy}</div>
 </section>`;
}
