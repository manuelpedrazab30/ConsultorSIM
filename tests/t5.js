const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8'),{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true});
const w=dom.window,errs=[];w.addEventListener('error',e=>errs.push('JS: '+e.message));
const $=s=>w.document.querySelector(s);w.Element.prototype.scrollIntoView=()=>{};
w.HTMLCanvasElement.prototype.getContext=function(){return {set fillStyle(v){},fillRect(){}}};
function fillWork(t){
  if(t.kind==='je'){const rows=[...w.document.querySelectorAll('#rows tr')];t.lines.forEach((l,i)=>{const [a,d,c]=rows[i].querySelectorAll('input');a.value=l.a;(l.s==='D'?d:c).value=l.v;});}
  else if(t.kind==='tb1'){t.rows.forEach((r,i)=>{w.document.querySelector(`input[name=s${i}][value=${r.s}]`).checked=true});$('#w1').value=t.total;}
  else if(t.kind==='tb2')$('#w1').value=t.hid.v;
  else if(t.kind==='cls')t.accs.forEach((a,i)=>{$('#c'+i).value=w.eval(`CATS[WA['${a}']]`)});
  else if(t.kind==='is'){const s=t.ans;$('#w1').value=s.rev;$('#w2').value=s.exp;$('#w3').value=s.ni;}
  else if(t.kind==='bs'){const s=t.ans;[s.ni,s.end,s.ta,s.tl,s.te].forEach((x,i)=>$('#w'+(i+1)).value=x);}
}
function run(sel,n){
  w.freeStart(sel,n); let k=0; const kinds={};
  while($('#act')||$('#wact')){ const D=w.eval('D'),c=D.q[D.i];
    if(c.kind){kinds[c.kind]=1;fillWork(c);w.workSubmit();}
    else{kinds.q=1;const i=c.opts?c.opts.findIndex(o=>o.ok):-1;
      if(c.mode==='mc'){w.document.querySelector(`input[name=mc][value="${i}"]`).checked=true;w.signMC();}
      else if(c.ok)w.approve();else{w.openReject();if(c.q.type==='numeric')$('#rv').value=c.q.answer;else if(c.q.type==='choice')w.document.querySelector(`input[name=rc][value="${c.q.answer}"]`).checked=true;else w.pickLine(c.mut);w.reject();}}
    if(!$('#verdict .stamp'))errs.push('sin sello');
    k++;w.eval('D.i++');w.deskCase();}
  const D=w.eval('D');return {k,ok:D.ok,kinds:Object.keys(kinds).join(','),rep:$('#app').innerHTML.includes('Free session report'),refs:[...new Set(D.q.filter(c=>c.q).map(c=>c.q.ref))]};
}
w.freeSetup();if(!$('#app').innerHTML.includes('Journal entries'))errs.push('setup');
for(const [sel,n] of [[['econ:4'],12],[['econ:8','acc:2'],8],[['wk:je','wk:fs','acc:9'],20],[['wk:tb'],8],[['econ:1','econ:12','acc:15','wk:adj'],30]]){
  const r=run(sel,n);console.log(sel.join(','),'n',n,'jugados',r.k,'ok',r.ok,r.kinds,r.refs.join('|'));
  if(r.k!==n||r.ok!==n||!r.rep)errs.push('falla '+sel);
}
// solo capítulos elegidos
const r=run(['econ:4'],12);if(r.refs.some(x=>!/Acemoglu Ch\.4/.test(x)))errs.push('capítulo ajeno '+r.refs);
// sin selección no arranca
w.freeSetup();w.freeAll('econ',false);w.freeAll('acc',false);$('#fn').value='8';w.freeStart();if(!$('#fe').textContent.includes('Select'))errs.push('sin selección arranca');
// recuerda selección
const sv=JSON.parse(w.localStorage.getItem('consultoru1')).free;if(!sv||!sv.sel.length)errs.push('no guarda');
w.freeSetup();if(!$('.fc:checked'))errs.push('no restaura');
console.log(errs.length?errs:'SIN ERRORES');
