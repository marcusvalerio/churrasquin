const fs=require('fs');const {P,G,word,S,H,X,ASC,T}=require('./glyphs.js');
const OUT='/home/user/churrasquin/brand/v2/a/';
const C={bordo:'#7A1C1C',carvao:'#1B1916',manteiga:'#EFE6D3',sebo:'#F8F3E8',violeta:'#56408A',brasa:'#D6502B',osso:'#CBBDA0'};
const f=n=>+n.toFixed(2);
// wordmark normalized: x from 0, baseline at y=0
const W=word('churrasquin');const wb=W.path.bounds;W.path.translate(new P.Point(-wb.x,0));
const POS=W.pos.map(([c,x])=>[c,x-wb.x]);const WD=W.path.pathData, WW=f(wb.width); // y range -150..53
// symbol: notched tile 200 + q
const TS=200,NR=24;
let tile=new P.Path.Rectangle(new P.Rectangle(0,0,TS,TS));
for(const [x,y] of [[0,0],[TS,0],[0,TS],[TS,TS]]) tile=tile.subtract(new P.Path.Circle(new P.Point(x,y),NR));
const q=G.q().g;const qb=q.bounds;const QX=f((TS-qb.width)/2-2),QBASE=f((TS-qb.height)/2+103);
q.scale(1.12,new P.Point(0,0));const qb2=q.bounds;q.translate(new P.Point(f((TS-qb2.width)/2-qb2.x-4),f((TS-qb2.height)/2-qb2.y+2)));
const TILE=tile.pathData, QD=q.pathData;
const sym=(bg,fg,extra='')=>`<path d="${TILE}" fill="${bg}"/><path d="${QD}" fill="${fg}"/>${extra}`;
const svg=(vb,body,w)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${w?` width="${w}"`:''}>${body}</svg>`;
const V={pos:{bg:C.manteiga,t:C.bordo,q:C.manteiga,w:C.carvao},neg:{bg:C.carvao,t:C.manteiga,q:C.carvao,w:C.manteiga},mono:{bg:'#FFFFFF',t:C.carvao,q:'#FFFFFF',w:C.carvao},bordo:{bg:C.bordo,t:C.manteiga,q:C.bordo,w:C.manteiga}};
// lockups
function horiz(v,pad=40,bg=true){const s=150/TS,gap=46,h=150+53;const w=150+gap+WW;
 return svg(`${-pad} ${-150-pad} ${w+2*pad} ${h+2*pad}`,(bg?`<rect x="${-pad}" y="${-150-pad}" width="${w+2*pad}" height="${h+2*pad}" fill="${v.bg}"/>`:'')+
 `<g transform="translate(0,-150) scale(${s})">${sym(v.t,v.q)}</g><path transform="translate(${150+gap},0)" d="${WD}" fill="${v.w}"/>`);}
function vert(v,pad=50,bg=true){const ts=230,w=Math.max(WW,ts),gap=60;const tx=(w-ts)/2;const top=-150-gap-ts;
 return svg(`${-pad} ${top-pad} ${w+2*pad} ${53-top+2*pad}`,(bg?`<rect x="${-pad}" y="${top-pad}" width="${w+2*pad}" height="${53-top+2*pad}" fill="${v.bg}"/>`:'')+
 `<g transform="translate(${tx},${top}) scale(${ts/TS})">${sym(v.t,v.q)}</g><path transform="translate(${(w-WW)/2},0)" d="${WD}" fill="${v.w}"/>`);}
const symbol=(v,pad=20)=>svg(`${-pad} ${-pad} ${TS+2*pad} ${TS+2*pad}`,`<rect x="${-pad}" y="${-pad}" width="${TS+2*pad}" height="${TS+2*pad}" fill="${v.bg}"/>`+sym(v.t,v.q));
const wordmark=(col)=>svg(`-10 -160 ${WW+20} 223`,`<path d="${WD}" fill="${col}"/>`);
for(const k of ['pos','neg','mono']){fs.writeFileSync(OUT+`logo-horizontal-${k}.svg`,horiz(V[k]));fs.writeFileSync(OUT+`logo-vertical-${k}.svg`,vert(V[k]));fs.writeFileSync(OUT+`simbolo-${k}.svg`,symbol(V[k]));}
fs.writeFileSync(OUT+'wordmark.svg',wordmark(C.carvao));
// app icon 1024: bordo field, q centered, no notch (OS masks); subtle inner frame of notched label
const icon=(sz)=>{const s=1024/TS*0.80;const qw=qb.width*s,qh=qb.height*s;
 return svg('0 0 1024 1024',`<rect width="1024" height="1024" fill="${C.bordo}"/><g transform="translate(${f((1024-qw)/2-8)},${f((1024-qh)/2+103*s)}) scale(${f(s)})"><path d="${G.q().g.pathData}" fill="${C.manteiga}"/></g>`,sz);};
fs.writeFileSync(OUT+'app-icon-1024.svg',icon());
module.exports={POS,C,WD,WW,TILE,QD,sym,horiz,vert,symbol,wordmark,icon,V,TS,svg,f,G,P,word};
