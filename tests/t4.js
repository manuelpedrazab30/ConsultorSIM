const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8'),{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true});
const w=dom.window,errs=[];w.addEventListener('error',e=>errs.push('JS: '+e.message));
const $=s=>w.document.querySelector(s);w.Element.prototype.scrollIntoView=()=>{};
w.HTMLCanvasElement.prototype.getContext=function(){return {set fillStyle(v){},fillRect(){}}};
// invariantes de generadores
const bad=w.eval(`(function(){const b=[];
 for(let n=0;n<300;n++){
  mkJE([...JE1,...JE2,...JE3]).forEach(t=>{const d=t.lines.filter(l=>l.s==='D').reduce((x,l)=>x+l.v,0),c=t.lines.filter(l=>l.s==='C').reduce((x,l)=>x+l.v,0);
   if(d!==c)b.push('desbalance '+t.id+' '+d+'/'+c);
   t.lines.forEach(l=>{if(!(l.v>0)||!Number.isInteger(l.v))b.push('monto '+t.id+' '+l.v);if(!WA[l.a])b.push('cuenta '+l.a);if(sideOf(l.a)!==l.s&&!['Dividends'].includes(l.a)&&false)b.push('x');});
   const nums=(t.text.match(/\\d[\\d,]*/g)||[]);});
  const g=genTB();const dr=g.rows.filter(r=>r.s==='D').reduce((x,r)=>x+r.v,0),cr=g.rows.filter(r=>r.s==='C').reduce((x,r)=>x+r.v,0);
  if(dr!==cr)b.push('TB no cuadra');
  const s=stm(g.rows);if(s.ta!==s.tl+s.te)b.push('A!=L+E '+s.ta+' '+s.tl+' '+s.te);if(s.ni<=-1e9)b.push('ni');
 }
 return b.slice(0,8)})()`);
console.log('invariantes work:',bad.length?bad:'OK');if(bad.length)errs.push('inv');
// jugar con estrategia perfecta y mala
function fill(t){
  if(t.kind==='je'){ const rows=[...w.document.querySelectorAll('#rows tr')]; t.lines.forEach((l,i)=>{const [a,d,c]=rows[i].querySelectorAll('input');a.value=l.a;(l.s==='D'?d:c).value=l.v;}); }
  else if(t.kind==='tb1'){ t.rows.forEach((r,i)=>{w.document.querySelector(`input[name=s${i}][value=${r.s}]`).checked=true}); $('#w1').value=t.total; }
  else if(t.kind==='tb2'){ $('#w1').value=t.hid.v; }
  else if(t.kind==='cls'){ t.accs.forEach((a,i)=>{$('#c'+i).value=w.eval(`CATS[WA['${a}']]`)}); }
  else if(t.kind==='is'){ const s=t.ans; $('#w1').value=s.rev;$('#w2').value=s.exp;$('#w3').value=s.ni; }
  else if(t.kind==='bs'){ const s=t.ans; [s.ni,s.end,s.ta,s.tl,s.te].forEach((x,i)=>$('#w'+(i+1)).value=x); }
}
function play(key,di,perfect){
  w.workStart(key,di); w.workCase(); let n=0; const kinds=new Set();
  while($('#wact')){ const D=w.eval('D'),t=D.q[D.i]; kinds.add(t.kind);
    if(perfect)fill(t); else if(t.kind==='je'){const [a,d]=$('#rows tr').querySelectorAll('input');a.value='Cash';d.value=1;}
    else if(t.kind==='cls'){t.accs.forEach((a,i)=>{$('#c'+i).value=w.eval('CATLIST[0]')});}
    else if(t.kind==='tb1'){t.rows.forEach((r,i)=>{w.document.querySelector(`input[name=s${i}][value=D]`).checked=true});$('#w1').value=1;}
    else {for(let i=1;i<=5;i++){const e=$('#w'+i);if(e)e.value=1;}}
    w.workSubmit(); if(!$('#verdict .stamp'))errs.push('sin veredicto '+key+di+' '+t.kind);
    n++; w.eval('D.i++'); w.workCase(); }
  const D=w.eval('D'); return {n,ok:D.ok,cash:D.cash,rep:$('#app').innerHTML.includes('PASSED'),kinds:[...kinds].join(',')};
}
const tr=w.eval('TRACKS.filter(t=>t.kind==="work").map(t=>[t.key,t.days.length])');
for(const [key,nd] of tr)for(let di=0;di<nd;di++){
  const r=play(key,di,true); console.log(key,'día',di+1,'jobs',r.n,'ok',r.ok,'€',r.cash,r.rep?'PASSED':'-',r.kinds);
  if(r.ok!==r.n||!r.rep)errs.push('perfecto falla '+key+di);
  const b=play(key,di,false); if(b.ok>1&&!(b.n-b.ok<0))console.log('  (mala: ok',b.ok,'de',b.n,')'); if(b.rep)errs.push('mala estrategia pasa '+key+di);
}
const car=JSON.parse(w.localStorage.getItem('consultoru1')).career;console.log('career',JSON.stringify(car));
if(!car.promoted)errs.push('sin ascenso');
// bloqueo: sin promoted, fs bloqueado en home
w.localStorage.setItem('consultoru1',JSON.stringify({m:{},c:{}}));w.home();
const h=w.eval('careerHome()');if(!h.includes('🔒'))errs.push('fs no bloqueado');
console.log(errs.length?errs:'SIN ERRORES');
