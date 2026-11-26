// churrasquin v3 — gerador (node _src/build.js). Sem dependências.
const fs=require('fs'),path=require('path');const OUT=path.join(__dirname,'..');
const C={papel:'#F3EADB',carvao:'#1F1A17',verm:'#EB6440',turq:'#3FA295'};
const mul=(a,b)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.substr(i,2),16)*parseInt(b.substr(i,2),16)/255).toString(16).padStart(2,'0')).join('').toUpperCase();
C.vv=mul(C.verm,C.verm);C.vt=mul(C.verm,C.turq);
const M='style="mix-blend-mode:multiply"';
// ---------- SÍMBOLO "Três fatias na tábua" — grade 13x × 13x, x=2 (viewBox 26) ----------
// fatias: círculos r=3x, centros a 3.5x (sobreposição 2.5x -> vesica); tábua: barra 11x × 1.5x, raio 0.75x
const X=2,r=3*X,cy=6*X,cxs=[3*X,6.5*X,10*X];
function symbol({bg=null,ink=C.verm,inter=C.vv,board=C.carvao,mono=false}={}){
  const circ=cxs.map(cx=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${ink}"/>`).join('');
  // lentes (interseções) desenhadas explicitamente — cor plana, sem depender de blend em 16px
  const h=Math.sqrt(r*r-(3.5*X/2)**2);
  const lens=[0,1].map(i=>{const mx=(cxs[i]+cxs[i+1])/2;return `<path d="M${mx} ${(cy-h).toFixed(3)}A${r} ${r} 0 0 1 ${mx} ${(cy+h).toFixed(3)}A${r} ${r} 0 0 1 ${mx} ${(cy-h).toFixed(3)}Z" fill="${mono?C.papel:inter}"${mono?' opacity="0"':''}/>`}).join('');
  const tab=`<rect x="${1*X}" y="${10*X}" width="${11*X}" height="${1.5*X}" rx="${.75*X}" fill="${board}"/>`;
  return (bg?`<rect x="-4" y="-4" width="34" height="34" fill="${bg}"/>`:'')+circ+(mono?'':lens)+tab;
}
const svg=(vb,body,extra='')=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${extra}>${body}</svg>`;
fs.writeFileSync(OUT+'/simbolo.svg',svg('0 1.5 26 26',symbol()));
fs.writeFileSync(OUT+'/simbolo-neg.svg',svg('-3 -1.5 32 32',symbol({bg:C.carvao,board:C.papel})));
fs.writeFileSync(OUT+'/simbolo-mono.svg',svg('0 1.5 26 26',symbol({ink:C.carvao,board:C.carvao,mono:true})));
fs.writeFileSync(OUT+'/app-icon-1024.svg',svg('0 0 1024 1024',`<rect width="1024" height="1024" fill="${C.papel}"/><g transform="translate(176 137) scale(25.85)">${symbol()}</g>`));
// ---------- LETTERING: estrutura da direção A (corte de faca 30°, q em gancho), pingo do i vira brasa redonda ----------
let WD=fs.readFileSync(path.join(OUT,'../v2/a/wordmark.svg'),'utf8').match(/ d="([^"]+)"/)[1];
WD=WD.replace('M712,-132.98889l26,-15.01111v14.98889l-26,15.01111z','');
// pingo: círculo r=17 (= metade de 34, raio externo dos bojos) apoiado no corte de 30°
const DOT={cx:725,cy:-128,r:17};
const word=(fill,dot=C.verm)=>`<path d="${WD}" fill="${fill}"/><circle cx="${DOT.cx}" cy="${DOT.cy}" r="${DOT.r}" fill="${dot}"/>`;
fs.writeFileSync(OUT+'/wordmark.svg',svg('-10 -160 846 223',word(C.carvao)));
// lockup horizontal: símbolo com altura = 150 (asc→base) * 1.1
const LK=(fg,bg,board)=>svg('-40 -210 1150 300',(bg?`<rect x="-40" y="-210" width="1150" height="300" fill="${bg}"/>`:'')+`<g transform="translate(0 -172) scale(8.2)">${symbol({board})}</g><g transform="translate(250 0)">${word(fg)}</g>`);
fs.writeFileSync(OUT+'/logo-horizontal.svg',LK(C.carvao,C.papel,C.carvao));
fs.writeFileSync(OUT+'/logo-horizontal-neg.svg',LK(C.papel,C.carvao,C.papel));
// ---------- ÍCONES blend — grade 24, área viva 20, traço-mínimo 2, raio de canto 2 ----------
const A=C.verm,B=C.turq;
const c=(x,y,r,f)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"${f===B?' '+M:''}/>`;
const rc=(x,y,w,h,rx,f,t='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}"${f===B?' '+M:''}${t?` transform="${t}"`:''}/>`;
const p=(d,f)=>`<path d="${d}" fill="${f}"${f===B?' '+M:''}/>`;
const P0=C.papel;
const I={
 boi:   c(12,14,7,A)+p('M3 5c0 4 2 6 6 6l1-3C7 8 5 7 3 5ZM21 5c0 4-2 6-6 6l-1-3c3 0 5-1 7-3Z',B)+rc(9,15,6,4,2,B),
 porco: c(12,12,8,A)+rc(7,13,10,6,3,B)+c(10,16,1,P0)+c(14,16,1,P0)+p('M5 3l5 4-5 2ZM19 3l-5 4 5 2Z',A),
 cordeiro: c(7,9,4,B)+c(12,7,4,B)+c(17,9,4,B)+c(12,11,4,B)+rc(8,10,8,11,4,A),
 frango: c(14,10,7,A)+rc(10,13,3,9,1.5,B,'rotate(45 11.5 17.5)')+c(5,20,2,B)+c(4,17,2,B),
 'pais-br': rc(2,5,20,14,2,B)+p('M12 6.5 20.5 12 12 17.5 3.5 12Z',A)+c(12,12,3.2,P0),
 'pais-ar': rc(2,5,20,14,2,B)+rc(2,9.5,20,5,0,P0)+c(12,12,3,A),
 'pais-uy': rc(2,5,20,14,2,P0)+rc(2,7,20,2,0,B)+rc(2,11,20,2,0,B)+rc(2,15,20,2,0,B)+rc(2,5,9,8,2,P0)+c(6.5,9,3,A),
 'pais-us': rc(2,5,20,14,2,A)+rc(2,8,20,2,0,P0)+rc(2,12,20,2,0,P0)+rc(2,16,20,1.5,0,P0)+rc(2,5,10,8,2,B),
 maciez: c(9,13,7,A)+c(16,11,6,B)+rc(2,20,20,2,1,C.carvao),
 gordura: p('M12 2C8 8 5 11 5 15a7 7 0 0 0 14 0c0-4-3-7-7-13Z',B)+c(12,15,4.5,A),
 sabor: p('M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 2 1 3 2 3 0-3 0-5 1-8Z',A)+c(12,16,4,B),
 turma: c(6,9,3.2,A)+c(12,7,3.2,B)+c(18,9,3.2,A)+p('M2 21a10 8 0 0 1 20 0Z',A)+p('M6 21a6 7 0 0 1 12 0Z',B),
 calculadora: rc(4,2,16,20,3,B)+rc(7,5,10,4,1,P0)+c(9,13,1.6,A)+c(15,13,1.6,A)+c(9,18,1.6,A)+rc(13,16.4,4,3.2,1.6,A),
 info: c(12,12,10,B)+rc(10.5,10,3,8,1.5,A)+c(12,6.8,1.8,A),
 adicionar: c(10,12,8,A)+rc(14,4,4,16,2,B)+rc(8,10,16,4,2,B),
 brasa: rc(2,16,20,3,1.5,C.carvao)+c(8,11,5,A)+c(15,10,6,B)+c(12,16,3,A),
};
for(const[k,v] of Object.entries(I))fs.writeFileSync(`${OUT}/icons/${k}.svg`,svg('0 0 24 24',`<g style="isolation:isolate">${v}</g>`));
fs.writeFileSync(OUT+'/_src/data.json',JSON.stringify({C,WD,DOT,icons:Object.keys(I)}));
console.log(C);
