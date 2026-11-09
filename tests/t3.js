const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true});
const w=dom.window,errs=[];w.addEventListener('error',e=>errs.push('JS: '+e.message));
const $=s=>w.document.querySelector(s);w.Element.prototype.scrollIntoView=()=>{};
let calls=[];w.HTMLCanvasElement.prototype.getContext=function(){return {set fillStyle(v){this._c=v},fillRect(x,y,a,b){calls.push([this._c,x,y,a,b])}}};
// 1) invariantes de generación de claims erróneos
w.eval(`window.__inv=(function(){const bad=[];
 const merge=ls=>{const m={};ls.forEach(l=>{const k=norm(l.a)+'|'+l.s;m[k]=(m[k]||0)+l.v});return m};
 QBANK.forEach((q,qi)=>{for(let n=0;n<400;n++){const c=mkCase(q);
  if(c.mode==='mc'){const t=c.opts.map(o=>o.t||JSON.stringify(o.lines));if(c.opts.length!==4||c.opts.filter(o=>o.ok).length!==1||new Set(t).size!==4)bad.push('mc '+q.concept+' '+t.join('/'));continue;}
  if(c.ok)continue;
  if(q.type==='numeric'&&!(Math.abs(c.claim-q.answer)>tolOf(q)))bad.push('num '+q.concept+' '+c.claim+' vs '+q.answer);
  if(q.type==='numeric'&&!isFinite(c.claim))bad.push('nan '+q.concept);
  if(q.type==='choice'&&c.claim===q.answer)bad.push('choice '+q.concept);
  if(q.type==='multientry'){const a=merge(c.lines),b=merge(q.lines);const ks=new Set([...Object.keys(a),...Object.keys(b)]);
    if([...ks].every(k=>Math.abs((a[k]||0)-(b[k]||0))<0.5))bad.push('mut igual '+q.concept);
    const o=q.lines[c.mut],m=c.lines[c.mut];if(o.a===m.a&&o.s===m.s&&o.v===m.v)bad.push('mut sin cambio '+q.concept);}}});
 return bad.slice(0,8)})()`);
const inv=w.__inv;console.log('invariantes:',inv.length?inv:'OK (64 preguntas x 400 sorteos)');
if(inv.length)errs.push('invariantes');
// 2) jugar todos los días con estrategia perfecta
function play(key,di,strategy){
  w.deskStart(key,di);
  if(!$('#app').innerHTML.includes('NEW'))errs.push(`día ${key}${di}: sin reglas NEW`);
  w.deskCase();
  const D=()=>w.eval('D');let n=0;
  while($('#act')){
    const d=D(),c=d.q[d.i];
    if(c.mode==='mc'){
      const want=strategy==='perfect'?c.opts.findIndex(o=>o.ok):c.opts.findIndex(o=>!o.ok);
      w.document.querySelector(`input[name=mc][value="${want}"]`).checked=true;w.signMC();
    } else if(strategy==='perfect'){
      if(c.ok)w.approve();
      else{w.openReject();
        if(c.q.type==='numeric')$('#rv').value=c.q.answer;
        else if(c.q.type==='choice')w.document.querySelector(`input[name=rc][value="${c.q.answer}"]`).checked=true;
        else w.pickLine(c.mut);
        w.reject();}
    } else w.approve();           // "aprobar todo"
    if(!$('#verdict .stamp'))errs.push('sin sello '+key+di);
    n++;
    w.eval('D.i++');w.deskCase();
  }
  return {n,ok:D().ok,cash:D().cash,warn:D().warn,miss:D().miss.length,report:$('#app').innerHTML.includes('PASSED')};
}
for(const key of ['econ','acc'])for(let di=0;di<5;di++){
  const r=play(key,di,'perfect');
  if(r.ok!==r.n||!r.report||r.cash!==50*r.n)errs.push('perfecto falla '+key+di+JSON.stringify(r));
  console.log(key,'día',di+1,'casos',r.n,'ok',r.ok,'€',r.cash,r.report?'PASSED':'-');
}
console.log('desbloqueo guardado:',JSON.stringify(JSON.parse(w.localStorage.getItem('consultoru1')).career));
// 3) aprobar todo: debe fallar solo en los claims erróneos y cobrar citaciones tras 2 avisos
const r=play('acc',1,'approve');
const wrongs=r.n-r.ok, exp=50*r.ok-75*Math.max(0,wrongs-2);
console.log('aprobar todo (acc día2): casos',r.n,'ok',r.ok,'fallos',wrongs,'€',r.cash,'esperado',exp);
if(r.cash!==exp)errs.push('economía');
w.home();if(!$('#app').innerHTML.includes('Consultant Desk'))errs.push('home sin career');

// pixel art: retratos deterministas y sellos
calls=[];w.eval("paint(document.createElement('canvas'),'abc')");const A=JSON.stringify(calls);calls=[];w.eval("paint(document.createElement('canvas'),'abc')");
if(A!==JSON.stringify(calls)||calls.length<20)errs.push('retrato no determinista o vacío');
calls=[];w.eval("paint(document.createElement('canvas'),'otro')");if(JSON.stringify(calls)===A)errs.push('retratos iguales con semillas distintas');
const sk=new Set();for(let i=0;i<40;i++){calls=[];w.eval("paint(document.createElement('canvas'),'s"+i+"')");sk.add(JSON.stringify(calls));}
console.log('retratos distintos en 40 semillas:',sk.size);if(sk.size<35)errs.push('poca variedad');
w.deskStart('acc',0);w.deskCase();w.approve();
console.log('sello presente:',!!$('.bigstamp'),'| cliente sale:',$('#pt').classList.contains('leave'));
if(!$('.bigstamp')||!$('#pt').classList.contains('leave'))errs.push('sello/animación');
const bz=w.eval(`QBANK.map(q=>[q.question,q.biz.text])`);
bz.forEach(([qq,t],i)=>{const nums=(qq.match(/\d[\d,.]*/g)||[]).map(x=>x.replace(/[,.]$/,''));const T=t.replace(/,/g,'');nums.forEach(n=>{if(!T.includes(n.replace(/,/g,'')))errs.push('biz '+i+' falta '+n)});});
if(w.eval('QBANK.length')!==w.eval('BIZ.length'))errs.push('BIZ length');
console.log(errs.length?errs:'SIN ERRORES');
