// Pure renderer for the Supabase-backed two-team Tug of War quiz mode.
// Positive position means the left team is winning. Deliberately no answer keys here.
export function tugOutcome(position){if(position > 0)return 'Purple Pullers';if(position < 0)return 'Teal Titans';return 'Draw';}
export function tugStage(game,players=[]){
 const pos=Math.max(-100,Math.min(100,Number(game.tug_position)||0));
 const left=players.filter(p=>p.team===1).length,right=players.filter(p=>p.team===2).length;
 const rounds=Array.isArray(game.tug_rounds)?game.tug_rounds:[];
 const last=rounds.at(-1);
 const final=game.status==='finished';
 const label=pos>0?'Purple is pulling ahead!':pos<0?'Teal is pulling ahead!':'The rope is level — every answer counts!';
 const winner=final?(pos===0?'It’s a draw!':`${tugOutcome(pos)} win the tug!`):label;
 // The flag moves to the left as team 1 pulls, and to the right as team 2 pulls.
 const percent=(50-pos*.34).toFixed(2);
 return `<section class="tug-stage" aria-label="Tug of War team progress: ${Math.round(pos)} towards purple" data-tug-stage>
 <div class="tug-sun" aria-hidden="true">✦</div>
 <div class="tug-header"><div class="tug-team purple"><span class="tug-team-icon">★</span><div><b>Purple Pullers</b><small>${left} puller${left===1?'':'s'}</small></div></div><div class="tug-midlabel">TUG OF WAR <span>QUIZ</span></div><div class="tug-team teal"><div><b>Teal Titans</b><small>${right} puller${right===1?'':'s'}</small></div><span class="tug-team-icon">✦</span></div></div>
 <div class="tug-field"><div class="tug-hills"></div><div class="tug-pit" aria-hidden="true"></div>
 <div class="tug-character left-char" aria-hidden="true"><span class="tug-face">👩🏽‍🎓</span><span class="tug-face">🧑🏻‍🎓</span><span class="tug-face">👨🏾‍🎓</span></div>
 <div class="tug-character right-char" aria-hidden="true"><span class="tug-face">👨🏼‍🎓</span><span class="tug-face">👩🏻‍🎓</span><span class="tug-face">🧑🏾‍🎓</span></div>
 <div class="tug-rope"><div class="tug-rope-line"></div><span class="tug-mark left-mark"></span><span class="tug-mark right-mark"></span><span class="tug-knot" style="left:${percent}%" aria-hidden="true"><i></i></span></div></div>
 <div class="tug-progress-line"><span>◀ PURPLE GOAL</span><span>${final?'RESULT':`ROUND ${Math.max(0,game.question_index+1)} / ${game.question_count}`}</span><span>TEAL GOAL ▶</span></div>
 <div class="tug-message" role="status"><strong>${winner}</strong>${last?`<span>Last pull: ${last.left_correct}/${last.left_total} Purple vs ${last.right_correct}/${last.right_total} Teal correct</span>`:`<span>Accuracy, not team size, determines how far the rope moves.</span>`}</div>
 </section>`;
}
