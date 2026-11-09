const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true});
const w=dom.window,errs=[];w.addEventListener('error',e=>errs.push(e.message));
const $=s=>w.document.querySelector(s);
const nB=w.eval('QBANK.length');console.log('preguntas en banco:',nB);
function playAll(si,wrongEvery){
  w.drill(si,0);const steps=w.eval('S.case.steps');let right=0;
  steps.forEach((st,k)=>{
    const wrong=wrongEvery&&k%wrongEvery===0;
    if(st.type==='numeric')$('#num').value=wrong?st.answer+99:st.answer;
    else if(st.type==='choice'){const r=w.document.querySelectorAll('input[name=ch]');r[wrong?(st.answer+1)%r.length:st.answer].checked=true;}
    else{ // multientry: rellenar filas
      const lines=wrong?st.lines.slice(1):st.lines;
      while(w.document.querySelectorAll('#rows tr').length<lines.length)w.addRow();
      const trs=w.document.querySelectorAll('#rows tr');
      lines.forEach((l,i)=>{const [a,d,c]=trs[i].querySelectorAll('input');
        a.value=i%2?l.a.toUpperCase().replace('—','-'):l.a; // prueba normalización
        (l.s==='D'?d:c).value=l.v;});
    }
    w.check();
    const ok=!!$('#fb .fb.ok');
    if(ok===!!wrong)errs.push(`drill ${si} paso ${k} (${st.concept}) esperaba ${wrong?'fallo':'acierto'}`);
    if(ok)right++;
    w.next();
  });
  return [right,steps.length];
}
console.log('Econ todo bien :',playAll(0,0).join('/'));
console.log('Acc todo bien  :',playAll(1,0).join('/'));
console.log('Acc con fallos :',playAll(1,3).join('/'));
w.home();console.log('home tiene "Weak spots":',$('#app').innerHTML.includes('Weak spots'));
w.drill(-1,10);console.log('drill de débiles:',w.eval('S.case.steps.length'),'preguntas');
// ¿hay alguna respuesta de opción múltiple mal indexada tras barajar?
w.eval('QBANK.filter(q=>q.type==="choice").forEach(q=>{const s=toStep(q);if(s.options[s.answer]!==q.options[q.answer])throw new Error("shuffle "+q.concept)})');
// verificación independiente de cifras clave
const c=(n,a,b,t=.01)=>{if(Math.abs(a-b)>t)errs.push('cifra '+n+' '+a+' vs '+b)};
c('wa',700*(2000+3600+7500)/1000,9170);c('ddb',(50000*.6)*.4,12000);c('quick',250/140,1.79);c('roe',110/500*100,22,.1);
c('negext',30/2,15);c('profit',(50-10)/4,10);c('tb',100/6,16.67);c('dep',3000+28000,31000);
console.log(errs.length?errs:'SIN ERRORES');
