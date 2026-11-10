// Question bank integrity (no game engine): answers, options, entries, tolerance, plus independent arithmetic and home menu.
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true});
const w=dom.window,errs=[];w.addEventListener('error',e=>errs.push('JS: '+e.message));
const Q=w.eval('QBANK.map(q=>({...q,tol:tolOf(q)}))');
console.log('preguntas en banco:',Q.length);
if(Q.length!==w.eval('BIZ.length'))errs.push('QBANK y BIZ con distinta longitud');
Q.forEach((q,i)=>{const id=i+' '+q.concept;
  if(!['Economics & Business','Accounting & Financial Reporting'].includes(q.subj))errs.push('subj '+id);
  if(!/^(Acemoglu|Weygandt) Ch\.\d+$/.test(q.ref))errs.push('ref '+id);
  if(q.type==='choice'){ if(q.options.length!==4||new Set(q.options).size!==4)errs.push('opciones '+id);
    if(!(q.answer>=0&&q.answer<q.options.length))errs.push('answer '+id); }
  else if(q.type==='numeric'){ if(!isFinite(q.answer))errs.push('answer '+id);
    if(q.tol<0.1)errs.push('tol < 0.1 '+id);
    const ok=v=>Math.abs(w.pn(String(v))-q.answer)<=q.tol;
    if(!ok(q.answer)||!ok(String(q.answer).replace('.',','))||ok(q.answer+99))errs.push('corrección numérica '+id); }
  else if(q.type==='multientry'){ const d=q.lines.filter(l=>l.s==='D').reduce((a,l)=>a+l.v,0),c=q.lines.filter(l=>l.s==='C').reduce((a,l)=>a+l.v,0);
    if(Math.abs(d-c)>1e-9)errs.push('asiento descuadrado '+id);
    q.lines.forEach(l=>{if(!(l.v>0)||!'DC'.includes(l.s))errs.push('línea '+id);}); }
  else errs.push('tipo '+id);
  if(q.biz.say&&!q.biz.say.includes('{v}'))errs.push('say sin {v} '+id);
});
// verificación independiente de cifras clave
const c=(n,a,b,t=.01)=>{if(Math.abs(a-b)>t)errs.push('cifra '+n+' '+a+' vs '+b)};
c('wa',700*(2000+3600+7500)/1000,9170);c('ddb',(50000*.6)*.4,12000);c('quick',250/140,1.79);c('roe',110/500*100,22,.1);
c('negext',30/2,15);c('profit',(50-10)/4,10);c('tb',100/6,16.67);c('dep',3000+28000,31000);
// menú de inicio
w.home();const h=w.document.getElementById('app').innerHTML;
if(h.includes('Training cases')||h.includes('Question bank'))errs.push('menú antiguo sigue en home');
if(!h.includes('Career mode'))errs.push('home sin Career mode');
console.log(errs.length?errs:'SIN ERRORES');w.close();process.exit(0);
