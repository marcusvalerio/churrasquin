const fs=require('fs');const {P,G,word,S,H,X,ASC,T}=require('./glyphs.js');
const OUT='/home/user/churrasquin/brand/v2/a/';
const C={bordo:'#7A1C1C',carvao:'#1B1916',manteiga:'#EFE6D3',sebo:'#F8F3E8',violeta:'#56408A',brasa:'#D6502B',osso:'#CBBDA0'};
const f=n=>+n.toFixed(2);
// wordmark normalized: x from 0, baseline at y=0
const W=word('churrasquin');const wb=W.path.bounds;W.path.translate(new P.Point(-wb.x,0));
const POS=W.pos.map(([c,x])=>[c,x-wb.x]);const WD=W.path.pathData, WW=f(wb.width); // y range -150..53
// symbol v3: MAPA DE CORTE — bloco 200 em 5 peças; a peça escolhida (paralelogramo = pingo do i) desliza 26 na linha da faca
const TS=200;const SM=require('./simbolo.js').X.mapa();
const SREST=SM.rest.pathData, QD=SM.pick.pathData, TILE=new P.Path.Rectangle(new P.Rectangle(0,0,TS,TS)).pathData;
const SB=SM.rest.unite(SM.pick).bounds; const SX=f(SB.x),SW=f(SB.width),SY=f(SB.y),SH=f(SB.height); // bbox real (peça sai da grade)
const sym=(bg,fg,extra='')=>`<path d="${SREST}" fill="${bg}"/><path d="${QD}" fill="${bg}"/>${extra}`;
const svg=(vb,body,w)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${w?` width="${w}"`:''}>${body}</svg>`;
const V={pos:{bg:C.manteiga,t:C.bordo,q:C.manteiga,w:C.carvao},neg:{bg:C.carvao,t:C.manteiga,q:C.carvao,w:C.manteiga},mono:{bg:'#FFFFFF',t:C.carvao,q:'#FFFFFF',w:C.carvao},bordo:{bg:C.bordo,t:C.manteiga,q:C.bordo,w:C.manteiga}};
// lockups
function horiz(v,pad=40,bg=true){const s=150/TS,gap=46+f((SW+SX-TS)*150/TS),h=150+53;const w=150+gap+WW;
 return svg(`${-pad} ${-150-pad} ${w+2*pad} ${h+2*pad}`,(bg?`<rect x="${-pad}" y="${-150-pad}" width="${w+2*pad}" height="${h+2*pad}" fill="${v.bg}"/>`:'')+
 `<g transform="translate(0,-150) scale(${s})">${sym(v.t,v.q)}</g><path transform="translate(${150+gap},0)" d="${WD}" fill="${v.w}"/>`);}
function vert(v,pad=50,bg=true){const ts=230,w=Math.max(WW,ts),gap=60;const tx=(w-ts)/2-f((SW+SX-TS)/2*ts/TS);const top=-150-gap-ts;
 return svg(`${-pad} ${top-pad} ${w+2*pad} ${53-top+2*pad}`,(bg?`<rect x="${-pad}" y="${top-pad}" width="${w+2*pad}" height="${53-top+2*pad}" fill="${v.bg}"/>`:'')+
 `<g transform="translate(${tx},${top}) scale(${ts/TS})">${sym(v.t,v.q)}</g><path transform="translate(${(w-WW)/2},0)" d="${WD}" fill="${v.w}"/>`);}
const symbol=(v,pad=24)=>{const S=Math.max(SW,SH)+2*pad,x0=f(SX+SW/2-S/2),y0=f(SY+SH/2-S/2);return svg(`${x0} ${y0} ${f(S)} ${f(S)}`,`<rect x="${x0}" y="${y0}" width="${f(S)}" height="${f(S)}" fill="${v.bg}"/>`+sym(v.t,v.q));};
const wordmark=(col)=>svg(`-10 -160 ${WW+20} 223`,`<path d="${WD}" fill="${col}"/>`);
for(const k of ['pos','neg','mono']){fs.writeFileSync(OUT+`logo-horizontal-${k}.svg`,horiz(V[k]));fs.writeFileSync(OUT+`logo-vertical-${k}.svg`,vert(V[k]));fs.writeFileSync(OUT+`simbolo-${k}.svg`,symbol(V[k]));}
fs.writeFileSync(OUT+'wordmark.svg',wordmark(C.carvao));
// app icon 1024: campo bordô, mapa a 58% do campo, centrado pelo bbox real (máscara do sistema faz a moldura)
const iconInner=(size,col)=>{const s=size*.58/Math.max(SW,SH);return `<g transform="translate(${f(size/2-(SX+SW/2)*s)},${f(size/2-(SY+SH/2)*s)}) scale(${f(s*1000)/1000})">${sym(col,col)}</g>`;};
const icon=(sz)=>svg('0 0 1024 1024',`<rect width="1024" height="1024" fill="${C.bordo}"/>`+iconInner(1024,C.manteiga),sz);
fs.writeFileSync(OUT+'app-icon-1024.svg',icon());
module.exports={iconInner,SREST,SX,SY,SW,SH,POS,C,WD,WW,TILE,QD,sym,horiz,vert,symbol,wordmark,icon,V,TS,svg,f,G,P,word};
