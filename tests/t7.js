// Calculator: parser + desk panel + keyboard. Prints SIN ERRORES on success.
const {JSDOM}=require('jsdom');const fs=require('fs');
const w=new JSDOM(fs.readFileSync(__dirname+'/../index.html','utf8'),{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.HTMLCanvasElement.prototype.getContext=()=>null;w.Element.prototype.scrollIntoView=()=>{};}}).window;
const bad=[];const eq=(a,b,m)=>{if(!(a===b||(Number.isNaN(a)&&Number.isNaN(b))||Math.abs(a-b)<1e-9))bad.push(m+': got '+a+' want '+b);};
const E=x=>w.calcEval(x);
eq(E('2+3×4'),14,'prec');eq(E('(2+3)×4'),20,'paren');eq(E('10÷4'),2.5,'div');eq(E('2^3^2'),512,'pow right');
eq(E('−3+5'),2,'unary');eq(E('√(16)+1'),5,'sqrt');eq(E('50%'),0.5,'pct');eq(E('200×15%'),30,'pct mul');
eq(E('120÷(2×3)'),20,'nested');eq(E('2+'),NaN,'trailing');eq(E('(2'),NaN,'unclosed');eq(E('1÷0'),Infinity,'div0');eq(E('abc'),NaN,'junk');
eq(E('(60000−6000)÷10'),5400,'depr');eq(E('20000×0.06×1÷12'),100,'interest');
// UI flow on the desk
w.deskStart('acc',0);w.deskCase();
const doc=w.document;
if(!doc.getElementById('calc'))bad.push('no calc panel');
if(!doc.getElementById('calc').hidden)bad.push('calc should start hidden');
w.calcToggle(); if(doc.getElementById('calc').hidden)bad.push('toggle did not open');
'1','2';['1','2','0','÷','7','='].forEach(k=>w.calcKey(k));
if(doc.getElementById('ce').textContent!=='120÷7')bad.push('expr order '+doc.getElementById('ce').textContent);
if(doc.getElementById('cr').textContent!=='17.14285714')bad.push('display '+doc.getElementById('cr').textContent);
w.calcKey('×');w.calcKey('7');w.calcKey('=');if(doc.getElementById('cr').textContent!=='120')bad.push('Ans chain '+doc.getElementById('cr').textContent);
w.calcKey('5');if(doc.getElementById('ce').textContent!=='5')bad.push('fresh after = '+doc.getElementById('ce').textContent);
w.calcKey('C');w.calcKey('3');w.calcKey('±');eq(w.eval('calcEval(CALC.expr)'),-3,'±');
// keyboard
w.calcKey('C');['4','*','2','Enter'].forEach(k=>doc.dispatchEvent(new w.KeyboardEvent('keydown',{key:k,bubbles:true})));
if(doc.getElementById('cr').textContent!=='8')bad.push('keyboard '+doc.getElementById('cr').textContent);
console.log(bad.length?bad:'SIN ERRORES');w.close();process.exit(0);
