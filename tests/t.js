const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true});
const w=dom.window;w.confirm=()=>true;
const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const $=s=>w.document.querySelector(s);
// verificación independiente de respuestas
const chk=(n,a,b)=>{if(Math.abs(a-b)>1e-6)errs.push('MAL '+n+' '+a+' vs '+b)};
chk('eq1',(120+20)/10,14);chk('eq2',(160+20)/10,18);chk('tax',(160+50)/10,21);
chk('mono',(100-10)/2,45);chk('dwl',.5*(55-10)*(90-45),1012.5);chk('cournot',100-60,40);
chk('fifo',100*10+150*12,2800);chk('wavg',250*4800/400,3000);chk('bd',.05*80000-1500,2500);
chk('turn',240000/76000,3.1579);chk('days',365*76000/240000,115.58);
// recorrer todos los casos con respuestas correctas
for(const c of w.eval('CASES')){
  w.start(c.id);
  for(const st of c.steps){
    if(st.type==='slider'){w.onSlide(st.answer);}
    else if(st.type==='numeric'){$('#num').value=st.answer;}
    else if(st.type==='choice'){w.document.querySelectorAll('input[name=ch]')[st.answer].checked=true;}
    else if(st.type==='entry'){$('#dr').value=st.dr;$('#cr').value=st.cr;$('#amt').value=st.amt;}
    w.check();
    if(!$('#fb .fb.ok'))errs.push('no ok en '+c.id+': '+st.concept);
    w.next();
  }
  console.log(c.id,'score',w.eval('S.score'),'/',c.steps.length,'| TB eq:',JSON.stringify(c.id==='acc-startup'?w.eqVals():''));
}
// camino de error: entrada mala dos veces
w.start('acc-startup');$('#dr').value='Cash';$('#cr').value='Cash';$('#amt').value=1;w.check();
if(!$('#fb .fb.ko')||$('#nx').style.display!=='none')errs.push('retry flujo');
w.check();if($('#nx').style.display==='none')errs.push('reveal no ocurrió');
w.home();
console.log('mastery',Object.keys(JSON.parse(w.localStorage.getItem('consultoru1')).m).length,'conceptos');
console.log(errs.length?errs:'SIN ERRORES');
