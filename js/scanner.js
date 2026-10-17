import {markerCodes,setupMarkers} from './markers.js';
import {$,esc,button,toast,busy} from './ui.js';
export function downloadCards(size='A4',layout='compact'){
 const {jsPDF}=window.jspdf,pdf=new jsPDF({format:size.toLowerCase(),unit:'mm'}),cols=layout==='large'?1:2,rows=layout==='large'?1:2;
 const w=pdf.internal.pageSize.getWidth(),h=pdf.internal.pageSize.getHeight(),cw=(w-20)/cols,ch=(h-24)/rows;
 for(let id=0;id<100;id++){
  const slot=id%(cols*rows);if(id&&slot===0)pdf.addPage();const x=10+(slot%cols)*cw,y=10+Math.floor(slot/cols)*ch,s=Math.min(cw-26,ch-43),mx=x+(cw-s)/2,my=y+22;
  pdf.setFont('helvetica','bold');pdf.setFontSize(11);pdf.text(`QuizArena  |  Card ${id+1}`,x+cw/2,y+7,{align:'center'});
  pdf.setFontSize(16);pdf.text('A',mx+s/2,my-4,{align:'center'});pdf.text('B',mx+s+5,my+s/2+2);pdf.text('C',mx+s/2,my+s+9,{align:'center'});pdf.text('D',mx-9,my+s/2+2);
  pdf.setFillColor(0);pdf.rect(mx,my,s,s,'F');const bits=BigInt('0x'+markerCodes[id]).toString(2).padStart(36,'0'),cell=s/8;pdf.setFillColor(255);
  for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(bits[r*6+c]==='1')pdf.rect(mx+(c+1)*cell,my+(r+1)*cell,cell+.01,cell+.01,'F');
  pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.text('Hold your answer letter at the top.',x+cw/2,my+s+17,{align:'center'});pdf.text('Keep this card flat and fully visible.',x+cw/2,my+s+22,{align:'center'});
 }
 pdf.save(`QuizArena-100-Cards-${size}-${layout}.pdf`);
}
export function markerAnswer(marker){const c=marker.corners,angle=Math.atan2(c[1].y-c[0].y,c[1].x-c[0].x)*180/Math.PI,quarter=Math.round(angle/90);if(Math.abs(angle-quarter*90)>22)return null;if(Math.min(...c.map((p,i)=>Math.hypot(p.x-c[(i+1)%4].x,p.y-c[(i+1)%4].y)))<28)return null;return 'ABCD'[((-quarter)%4+4)%4];}
export async function startScanner(video,overlay,onStable,onStatus){
 if(!window.isSecureContext)throw Error('Camera scanning requires HTTPS or localhost.');
 if(!navigator.mediaDevices?.getUserMedia)throw Error('This browser cannot access a camera. Use manual entry or a supported mobile browser.');
 setupMarkers();const detector=new AR.Detector({dictionaryName:'QUIZARENA',maxHammingDistance:0}),stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
 video.srcObject=stream;try{await video.play();}catch(e){stream.getTracks().forEach(t=>t.stop());throw e;}
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true}),history=new Map();let stopped=false,handle;
 async function frame(){if(stopped)return;if(video.readyState>=2){const scale=Math.min(1,800/video.videoWidth);canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);overlay.width=canvas.width;overlay.height=canvas.height;const draw=overlay.getContext('2d');ctx.drawImage(video,0,0,canvas.width,canvas.height);const markers=detector.detect(ctx.getImageData(0,0,canvas.width,canvas.height)),now=performance.now();let uncertain=0;
  for(const m of markers){const answer=markerAnswer(m),card=m.id+1;let entry=history.get(card);if(!answer||m.hammingDistance!==0){uncertain++;continue;}if(!entry||entry.answer!==answer||now-entry.last>500)entry={answer,count:0,since:now,last:now,sent:false};entry.count++;entry.last=now;history.set(card,entry);const stable=entry.count>=4&&now-entry.since>=450;draw.strokeStyle=stable?'#37e4a4':'#ffc857';draw.lineWidth=3;draw.beginPath();m.corners.forEach((p,i)=>i?draw.lineTo(p.x,p.y):draw.moveTo(p.x,p.y));draw.closePath();draw.stroke();draw.font='bold 18px sans-serif';draw.fillStyle=draw.strokeStyle;draw.fillText(`${card} · ${answer}`,m.corners[0].x,m.corners[0].y-6);if(!stable)uncertain++;
  if(stable&&!entry.sent){entry.sent=true;Promise.resolve(onStable(card,answer)).catch(()=>{entry.sent=false;});}}
  for(const [k,v] of history)if(now-v.last>1600)history.delete(k);onStatus?.(uncertain);
 }handle=setTimeout(frame,110);}
 frame();return ()=>{stopped=true;clearTimeout(handle);stream.getTracks().forEach(t=>t.stop());video.srcObject=null;};
}
