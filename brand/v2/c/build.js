const fs=require('fs');const {wordmark,drip}=require('./mark.js');
const OUT='/home/user/churrasquin/brand/v2/c/';
const C={pink:'#FF4F8B',cobalt:'#2230F5',sun:'#FFD12E',green:'#14B26A',coal:'#2A0E14',cream:'#FFF3E2'};
const W=wordmark();const VB={x:-50,y:-880,w:W.width+80,h:1360};
const wmInner=f=>W.svg(f);
// symbol in 1000 box
function melt(cx,cy,R,x,w,L,rf){const a=x-w/2,bb=x+w/2,Rb=w*0.6,yb=cy+R+L-Rb;
 const f=(px)=>{const fy=cy+Math.sqrt((R+rf)**2-(px-cx)**2);const k=R/(R+rf);return {fy,T:[cx+(px-cx)*k,cy+(fy-cy)*k]};};
 const l=f(a-rf),r=f(bb+rf);const n=v=>+v.toFixed(1);
 return `M${cx} ${cy}L${n(l.T[0])} ${n(l.T[1])}A${rf} ${rf} 0 0 1 ${a} ${n(l.fy)}L${a} ${n(yb-Rb*1.6)}C${a} ${n(yb-Rb*0.9)} ${n(x-Rb)} ${n(yb-Rb*0.8)} ${n(x-Rb)} ${n(yb)}A${Rb} ${Rb} 0 0 0 ${n(x+Rb)} ${n(yb)}C${n(x+Rb)} ${n(yb-Rb*0.8)} ${bb} ${n(yb-Rb*0.9)} ${bb} ${n(yb-Rb*1.6)}L${bb} ${n(r.fy)}A${rf} ${rf} 0 0 1 ${n(r.T[0])} ${n(r.T[1])}Z`;}
const symInner=(f)=>{const cx=500,cy=400,R=330;
 return `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${f}"/><path fill="${f}" d="${melt(cx,cy,R,425,150,270,48)}${melt(cx,cy,R,640,150,150,48)}"/>`;};
const shades=(f)=>`<g fill="${f}"><path d="M232 330H478L460 448Q452 492 408 492H300Q256 492 248 448Z"/><path d="M522 330H768L750 448Q742 492 698 492H590Q546 492 538 448Z"/><rect x="460" y="330" width="80" height="34"/><rect x="200" y="318" width="600" height="34" rx="17"/></g>`;
const svg=(vb,inner,bg)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${bg?`<rect x="${vb.split(' ')[0]}" y="${vb.split(' ')[1]}" width="${vb.split(' ')[2]}" height="${vb.split(' ')[3]}" fill="${bg}"/>`:''}${inner}</svg>`;
const vbW=`${VB.x} ${VB.y} ${VB.w} ${VB.h}`;
const files={};
const variants={ // name: [wordFill, symFill, bg]
 'positivo':[C.pink,C.sun,C.cobalt],'creme':[C.cobalt,C.pink,C.cream],'negativo':[C.cream,C.sun,C.coal],
 'rosa':[C.pink,C.sun,null],'cobalto':[C.cobalt,C.pink,null],'mono-preto':[C.coal,C.coal,null],'mono-branco':['#fff','#fff',null]};
for(const [n,[wf,sf,bg]] of Object.entries(variants)){
 files[`wordmark-${n}.svg`]=svg(vbW,wmInner(wf),bg);
 files[`simbolo-${n}.svg`]=svg('0 0 1000 1000',symInner(sf),bg);
 // horizontal: symbol scaled to 1150 tall placed left
 const s=1.15, hw=1000*s+60+W.width+80;
 files[`lockup-h-${n}.svg`]=svg(`-60 -880 ${hw+60} 1360`,`<g transform="translate(0 -731) scale(${s})">${symInner(sf)}</g><g transform="translate(${1000*s+80} 0)">${wmInner(wf)}</g>`,bg);
 // vertical
 const vw=W.width+160, sc=2.4;
 files[`lockup-v-${n}.svg`]=svg(`-80 -3460 ${vw} 3940`,`<g transform="translate(${(W.width-1000*sc)/2} -3400) scale(${sc})">${symInner(sf)}</g>${wmInner(wf)}`,bg);
}
files['mascote-solzao.svg']=svg('0 0 1000 1000',symInner(C.sun)+shades(C.coal));
files['icone-app-1024.svg']=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="${C.cobalt}"/><g transform="translate(152 120) scale(.72)">${symInner(C.sun)}</g></svg>`;
files['icone-app-mascote.svg']=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="${C.pink}"/><g transform="translate(152 120) scale(.72)">${symInner(C.sun)}${shades(C.coal)}</g></svg>`;
files['favicon.svg']=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><rect width="1000" height="1000" rx="220" fill="${C.cobalt}"/><g transform="translate(110 90) scale(.78)">${symInner(C.sun)}</g></svg>`;
// construction drawing
const gl=[[0,'linha de base'],[-520,'altura-x 520'],[-739,'ascendente 739'],[470,'gota máx. 470']];
let cons=`<rect x="${VB.x}" y="${VB.y}" width="${VB.w}" height="${VB.h}" fill="${C.cream}"/>`;
for(let x=0;x<W.width;x+=118) cons+=`<line x1="${x}" x2="${x}" y1="${VB.y}" y2="${VB.y+VB.h}" stroke="${C.cobalt}" stroke-opacity=".12" stroke-width="3"/>`;
for(const [y,t] of gl) cons+=`<line x1="${VB.x}" x2="${VB.x+VB.w}" y1="${y}" y2="${y}" stroke="${C.cobalt}" stroke-width="4" stroke-dasharray="${y==0?'0':'18 12'}"/><text x="${VB.x+20}" y="${y-16}" font-family="DM Mono,monospace" font-size="38" fill="${C.cobalt}">${t}</text>`;
cons+=`<g opacity=".92">${wmInner(C.pink)}</g><g fill="none" stroke="${C.coal}" stroke-width="5"><path d="${W.d}"/></g>`;
files['construcao-wordmark.svg']=svg(vbW,cons);
{const cx=500,cy=400,R=330,rf=48;let g='';
 for(const [x,w] of [[425,150],[640,150]]){for(const px of [x-w/2-rf,x+w/2+rf]){const fy=cy+Math.sqrt((R+rf)**2-(px-cx)**2);g+=`<circle cx="${px}" cy="${fy.toFixed(1)}" r="${rf}" fill="none" stroke="${C.pink}" stroke-width="4" stroke-dasharray="10 8"/><circle cx="${px}" cy="${fy.toFixed(1)}" r="5" fill="${C.pink}"/>`;}
  g+=`<line x1="${x-w/2}" x2="${x-w/2}" y1="${cy}" y2="1000" stroke="${C.cream}" stroke-opacity=".35" stroke-width="2"/><line x1="${x+w/2}" x2="${x+w/2}" y1="${cy}" y2="1000" stroke="${C.cream}" stroke-opacity=".35" stroke-width="2"/>`;}
 files['construcao-simbolo.svg']=svg('0 0 1000 1000',`<rect width="1000" height="1000" fill="${C.cobalt}"/><g opacity=".22">${symInner(C.cream)}</g><g stroke="${C.cream}" stroke-opacity=".35" stroke-width="2"><line x1="0" x2="1000" y1="${cy}" y2="${cy}"/><line x1="${cx}" x2="${cx}" y1="0" y2="1000"/><line x1="0" x2="1000" y1="${cy+R}" y2="${cy+R}"/></g><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.sun}" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="6" fill="${C.sun}"/>${g}<g font-family="DM Mono,monospace" font-size="26" fill="${C.cream}"><text x="${cx+14}" y="${cy-14}">R 330</text><text x="30" y="${cy+R-12}">base do sol · y 730</text><text x="30" y="980" fill="${C.pink}">concordâncias r 48, tangentes</text><text x="352" y="40">w 150</text><text x="567" y="40">w 150</text></g>`);}
for(const [k,v] of Object.entries(files)) fs.writeFileSync(OUT+k,v);
fs.writeFileSync(__dirname+'/meta.json',JSON.stringify({VB,W:W.width}));
console.log(Object.keys(files).length,'files');
