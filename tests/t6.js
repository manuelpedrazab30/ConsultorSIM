const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8'),{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true});
const w=dom.window,errs=[];w.addEventListener('error',e=>errs.push('JS: '+e.message));
const $=s=>w.document.querySelector(s);w.Element.prototype.scrollIntoView=()=>{};
let segs=0;
w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({},{get:(t,k)=>k==='stroke'?()=>{segs++}:(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}})};
w.HTMLCanvasElement.prototype.toDataURL=()=>'data:image/png;base64,AAAA';
w.Element.prototype.getBoundingClientRect=function(){return {left:0,top:0,width:300,height:170}};
const ev=(t,type,o={})=>{const e=new w.MouseEvent(type,{bubbles:true,clientX:o.x||0,clientY:o.y||0,buttons:o.buttons||0});Object.defineProperty(e,'pointerType',{value:o.pt||'mouse'});Object.defineProperty(e,'pressure',{value:o.p??0.5});Object.defineProperty(e,'pointerId',{value:1});t.dispatchEvent(e);};
w.deskStart('econ',1);w.eval('D.showNew=false');w.deskCase();
if(!$('#pad'))errs.push('sin pad');
if(!w.eval('PAD'))errs.push('PAD no inicia');
const cv=$('#pad');
// lápiz dibuja
ev(cv,'pointerdown',{pt:'pen',x:10,y:10,p:0.8});ev(cv,'pointermove',{pt:'pen',x:60,y:40,p:0.9});ev(cv,'pointermove',{pt:'pen',x:90,y:20});ev(cv,'pointerup',{pt:'pen'});
if(w.eval('PAD.strokes.length')!==1)errs.push('trazo lápiz');
if(w.eval('PAD.strokes[0].pts.length')!==3)errs.push('puntos '+w.eval('PAD.strokes[0].pts.length'));
// palma (touch) ignorada tras ver lápiz
ev(cv,'pointerdown',{pt:'touch',x:5,y:5});ev(cv,'pointermove',{pt:'touch',x:50,y:50});ev(cv,'pointerup',{pt:'touch'});
if(w.eval('PAD.strokes.length')!==1)errs.push('palma dibuja');
// borrador y color
w.padTool('er');ev(cv,'pointerdown',{pt:'pen',x:20,y:20});ev(cv,'pointermove',{pt:'pen',x:30,y:30});ev(cv,'pointerup',{pt:'pen'});
if(!w.eval('PAD.strokes[1].er'))errs.push('borrador');
w.padInk('#a8352b');ev(cv,'pointerdown',{pt:'pen',x:1,y:1});ev(cv,'pointerup',{pt:'pen'});
if(w.eval('PAD.strokes[2].c')!=='#a8352b'||w.eval('PAD.strokes[2].er'))errs.push('tinta');
w.padUndo();if(w.eval('PAD.strokes.length')!==2)errs.push('undo');
// big board
w.padBig();if(!$('#padwrap').classList.contains('big'))errs.push('big');w.padBig();if($('#padwrap').classList.contains('big'))errs.push('big off');
// guardado al decidir (fallar): elegir opción incorrecta o aprobar mal
let c=w.eval('D.q[D.i]');
if(c.mode==='mc'){const i=c.opts.findIndex(o=>!o.ok);$$=w.document.querySelector(`input[name=mc][value="${i}"]`);$$.checked=true;w.signMC();}
else{ if(c.ok){w.openReject();if(c.q.type==='numeric')$('#rv').value=c.q.answer+999;else if(c.q.type==='choice')w.document.querySelector('input[name=rc]').checked=true;else w.pickLine(0);w.reject();} else w.approve(); }
const pads=w.eval('D.pads||[]');if(pads.length!==1)errs.push('pad no guardado '+pads.length);
// pad vacío no se guarda
w.eval('D.i++');w.deskCase();let c2=w.eval('D.q[D.i]');if(c2.mode==='mc'){w.document.querySelector('input[name=mc]').checked=true;w.signMC();}else w.approve();
if(w.eval('(D.pads||[]).length')!==1)errs.push('pad vacío guardado');
// reporte muestra miniatura de fallos
w.eval('D.i=D.q.length');w.deskCase();
const rep=$('#app').innerHTML;
if(pads[0].ok===false&&!rep.includes('scratch work'))errs.push('reporte sin miniaturas');
// trabajo (bookkeeping) también guarda
w.workStart('book',0);w.eval('D.showNew=false');w.workCase();const cv2=$('#pad');ev(cv2,'pointerdown',{pt:'pen',x:3,y:3});ev(cv2,'pointermove',{pt:'pen',x:30,y:9});ev(cv2,'pointerup',{pt:'pen'});
const [a,d]=$('#rows tr').querySelectorAll('input');a.value='Cash';d.value=1;w.workSubmit();
if(w.eval('(D.pads||[]).length')!==1)errs.push('pad work');
// meta y fuentes
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
if(html.includes('fonts.googleapis'))errs.push('aún usa Google Fonts');if(!html.includes('font/woff2;base64'))errs.push('sin fuente');if(!html.includes('rel="manifest"'))errs.push('sin manifest');
console.log(errs.length?errs:'SIN ERRORES');
