// Mathside-inspired mathematics editor for QuizArena's question builder.
// Keeps QuizArena's existing $...$ KaTeX storage format. No database changes.
const groups = [
  ['Common', [
    ['a⁄b', String.raw`\frac{\placeholder{}}{\placeholder{}}`], ['x²', String.raw`\placeholder{}^{2}`],
    ['xⁿ', String.raw`\placeholder{}^{\placeholder{}}`], ['√', String.raw`\sqrt{\placeholder{}}`],
    ['ⁿ√', String.raw`\sqrt[\placeholder{}]{\placeholder{}}`], ['|x|',String.raw`\left|\placeholder{}\right|`],
    ['±',String.raw`\pm`],['×',String.raw`\times`],['÷',String.raw`\div`],
    ['≠',String.raw`\neq`],['≤',String.raw`\le`],['≥',String.raw`\ge`]
  ]],
  ['Greek & functions', [
    ['π',String.raw`\pi`],['θ',String.raw`\theta`],['∞',String.raw`\infty`],
    ['sin',String.raw`\sin\left(\placeholder{}\right)`],['cos',String.raw`\cos\left(\placeholder{}\right)`],
    ['tan',String.raw`\tan\left(\placeholder{}\right)`],['log',String.raw`\log_{\placeholder{}}\left(\placeholder{}\right)`],
    ['ln',String.raw`\ln\left(\placeholder{}\right)`],['eˣ',String.raw`e^{\placeholder{}}`],
    ['( )',String.raw`\left(\placeholder{}\right)`],['[ ]',String.raw`\left[\placeholder{}\right]`],
    ['{ }',String.raw`\left\{\placeholder{}\right\}`]
  ]],
  ['Advanced', [
    ['Σ',String.raw`\sum_{\placeholder{}}^{\placeholder{}}\placeholder{}`],
    ['∫',String.raw`\int_{\placeholder{}}^{\placeholder{}}\placeholder{}\,dx`],
    ['lim',String.raw`\lim_{\placeholder{}\to\placeholder{}}\placeholder{}`],
    ['d/dx',String.raw`\frac{d}{dx}\left(\placeholder{}\right)`],
    ['∈',String.raw`\in`],['∉',String.raw`\notin`],['∪',String.raw`\cup`],
    ['∩',String.raw`\cap`],['⊆',String.raw`\subseteq`],['∅',String.raw`\emptyset`],
    ['ℝ',String.raw`\mathbb{R}`],['ℕ',String.raw`\mathbb{N}`]
  ]]
];
let dialog, target, start=0, end=0;
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function markup(){return `<div class="qa-math-panel"><header><span class="qa-math-overline">QUIZARENA • MATH INPUT</span><button class="qa-math-close" type="button" data-math-close aria-label="Close math keyboard">×</button><h2>Math Keyboard</h2><p id="qaMathTarget">Add an equation to your question or answer.</p></header><div class="qa-math-body"><math-field id="qaMathLive" math-virtual-keyboard-policy="manual" aria-label="Enter an equation" hidden></math-field><textarea id="qaMathFallback" rows="3" aria-label="Enter LaTeX expression" placeholder="Type e.g. \\frac{a}{b} or x^2"></textarea><div class="qa-math-mobile"><div class="qa-math-tabs"><button type="button" data-math-tab="numbers" class="is-on">123</button><button type="button" data-math-tab="letters">ABC</button></div><div class="qa-math-typing" id="qaMathTyping"></div></div>${groups.map(([name,keys])=>`<section class="qa-math-group"><strong>${name}</strong><div class="qa-math-grid">${keys.map(([label,latex])=>`<button type="button" data-math-latex="${esc(latex)}">${esc(label)}</button>`).join('')}</div></section>`).join('')}<p class="qa-math-tip">Enter expressions as mathematics. Mathside-style keys are available on mobile too. Preview before saving.</p><footer><button type="button" data-math-clear>Clear</button><button class="qa-math-insert" type="button" data-math-accept>Insert into field</button></footer></div></div>`;}
function active(){return dialog.querySelector('#qaMathLive').hidden?dialog.querySelector('#qaMathFallback'):dialog.querySelector('#qaMathLive');}
function setText(text){const field=active();if(typeof field.insert==='function'){field.insert(text);return;}const s=field.selectionStart ?? field.value.length,e=field.selectionEnd ?? s;field.value=field.value.slice(0,s)+text.replace(/\\placeholder\{\}/g,'□')+field.value.slice(e);field.focus();field.setSelectionRange?.(s+text.length,s+text.length);}
function makeDigits(mode){const numbers=['7','8','9','+','4','5','6','−','1','2','3','=','0','.','(',')'];const letters='abcdefghijklmnopqrstuvwxyz'.split('');dialog.querySelector('#qaMathTyping').innerHTML=(mode==='letters'?letters:numbers).map(x=>`<button type="button" data-math-character="${esc(x)}">${esc(x)}</button>`).join('')+`<button type="button" data-math-cmd="deleteBackward" aria-label="Delete character">⌫</button>`;dialog.querySelectorAll('[data-math-tab]').forEach(x=>x.classList.toggle('is-on',x.dataset.mathTab===mode));}
function ensure(){if(dialog)return;dialog=document.createElement('dialog');dialog.className='qa-math-dialog';dialog.innerHTML=markup();document.body.appendChild(dialog);
  dialog.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-math-close')){dialog.close();return;}if(b.hasAttribute('data-math-tab')){makeDigits(b.dataset.mathTab);return;}if(b.hasAttribute('data-math-latex')){setText(b.dataset.mathLatex);return;}if(b.hasAttribute('data-math-character')){setText(b.dataset.mathCharacter);return;}if(b.hasAttribute('data-math-cmd')){const f=active();if(f.executeCommand)f.executeCommand(b.dataset.mathCmd);else{f.focus();document.execCommand?.('delete');}return;}if(b.hasAttribute('data-math-clear')){active().value='';active().focus();return;}if(b.hasAttribute('data-math-accept')){const input=active();const latex=String(input.value||'').trim().replace(/\\placeholder\{\}/g,'\\square ');if(!latex||!target?.isConnected)return;const value=target.value||'';const math=`$${latex}$`;target.value=value.slice(0,start)+math+value.slice(end);target.dispatchEvent(new Event('input',{bubbles:true}));const caret=start+math.length;target.focus();target.setSelectionRange?.(caret,caret);dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('qa-math-open');target=null;});makeDigits('numbers');}
export function openMathKeyboard(field,label='Question'){if(!field)return;ensure();target=field;start=field.selectionStart??field.value.length;end=field.selectionEnd??start;dialog.querySelector('#qaMathTarget').textContent=`Insert formatted mathematics into: ${label}.`;
 const live=dialog.querySelector('#qaMathLive'),fallback=dialog.querySelector('#qaMathFallback');const supported=Boolean(customElements.get('math-field'));live.hidden=!supported;fallback.hidden=supported;live.value='';fallback.value='';dialog.showModal();document.body.classList.add('qa-math-open');setTimeout(()=>active().focus(),30);}
