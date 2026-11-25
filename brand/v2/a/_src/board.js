const fs=require('fs');const B=require('./build.js');const {POS,C,WD,WW,TILE,QD,sym,horiz,vert,symbol,icon,V,TS,svg,f,G,P}=B;
const OUT='/home/user/churrasquin/brand/v2/a/';
const T30=Math.tan(Math.PI/6);
const wm=(col,x=0,y=0,s=1)=>`<path transform="translate(${x},${y}) scale(${s})" d="${WD}" fill="${col}"/>`;
const tile=(bg,fg,x=0,y=0,s=1)=>`<g transform="translate(${x},${y}) scale(${s})">${sym(bg,fg)}</g>`;
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const barcode=(x,y,w,h,col)=>{let o='',cx=x;while(cx<x+w){const bw=[1,1,2,3][Math.floor(rnd()*4)]*1.3;if(rnd()>.45)o+=`<rect x="${f(cx)}" y="${y}" width="${f(bw)}" height="${h}" fill="${col}"/>`;cx+=bw;}return o;};
const grain=(id,op=.18,freq=.9)=>`<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${op} 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;

// ---------- construction: wordmark
function constrWord(){const pad=60,w=WW+2*pad;const xs=[];
 const lines=[[-150,'ascendente 150'],[-103,'overshoot +3'],[-100,'altura-x 100'],[0,'linha de base 0'],[58,'gancho 58']];
 let g=`<rect x="${-pad}" y="-210" width="${w}" height="320" fill="${C.sebo}"/>`;
 for(let x=-pad;x<WW+pad;x+=10)g+=`<line x1="${x}" x2="${x}" y1="-210" y2="120" stroke="${C.osso}" stroke-width=".25"/>`;
 for(let y=-210;y<110;y+=10)g+=`<line x1="${-pad}" x2="${WW+pad}" y1="${y}" y2="${y}" stroke="${C.osso}" stroke-width=".25"/>`;
 g+=wm(C.carvao)+`<path d="${WD}" fill="none" stroke="${C.brasa}" stroke-width=".5"/>`;
 for(const [y,l] of lines){g+=`<line x1="${-pad}" x2="${WW+pad}" y1="${y}" y2="${y}" stroke="${y==-103?C.brasa:C.violeta}" stroke-width="${y==-103?.4:.7}" ${y==-103?'stroke-dasharray="2 2"':''}/><text x="${y==-103?WW+pad-4:-pad+4}" y="${y-3}" text-anchor="${y==-103?'end':'start'}" class="lab">${l}</text>`;}
 // knife guides through bevels (30deg)
 const hx=POS.find(p=>p[0]=="h")[1];const ks=[];for(const [c,x] of POS){if('nru'.includes(c))ks.push([x,-100]);if(c=='u')ks.push([x+44,-100]);if(c=='h')ks.push([x,-150]);if(c=='i')ks.push([x,-100],[x,-148]);}
 for(const [x0,t] of ks){const y0=t+26*T30;g+=`<line x1="${x0-34}" y1="${y0+T30*34}" x2="${x0+26+34}" y2="${y0-T30*(26+34)}" stroke="${C.brasa}" stroke-width=".6"/>`;}
 g+=`<line x1="${hx+26}" x2="${hx+26}" y1="-118" y2="-30" stroke="${C.violeta}" stroke-width=".5"/><text x="${hx+28}" y="-112" class="lab">26</text>`;
 g+=`<text x="${WW+pad-4}" y="-170" text-anchor="end" class="lab b">corte de faca · 30° · todas as entradas de haste</text>`;
 return `<svg viewBox="${-pad} -210 ${w} 320" class="constr">${g}</svg>`;}
// ---------- construction: symbol
function constrSym(){let g=`<rect x="-40" y="-40" width="280" height="280" fill="${C.sebo}"/>`;
 for(let i=0;i<=10;i++){g+=`<line x1="${i*20}" x2="${i*20}" y1="-20" y2="220" stroke="${C.osso}" stroke-width=".5"/><line y1="${i*20}" y2="${i*20}" x1="-20" x2="220" stroke="${C.osso}" stroke-width=".5"/>`;}
 g+=sym(C.bordo,C.manteiga);
 for(const [x,y] of [[0,0],[200,0],[0,200],[200,200]])g+=`<circle cx="${x}" cy="${y}" r="24" fill="none" stroke="${C.violeta}" stroke-width=".8" stroke-dasharray="3 2"/>`;
 g+=`<path d="${QD}" fill="none" stroke="${C.brasa}" stroke-width=".8"/>`;
 g+=`<line x1="-20" y1="100" x2="220" y2="100" stroke="${C.violeta}" stroke-width=".5"/><line x1="100" y1="-20" x2="100" y2="220" stroke="${C.violeta}" stroke-width=".5"/>`;
 return `<svg viewBox="-40 -40 280 280" class="constr">${g}<text x="-34" y="-28" class="lab">grade 10×10 · módulo 20</text><text x="-34" y="236" class="lab">entalhe r24 = etiqueta de balança</text></svg>`;}

// ---------- phone
function phone(){const W=390,Hh=820;let g=`<defs><clipPath id="scr"><rect x="14" y="14" width="${W-28}" height="${Hh-28}" rx="46"/></clipPath>${grain('gp',.10)}</defs>
 <rect width="${W}" height="${Hh}" rx="58" fill="#0E0D0C"/><rect x="4" y="4" width="${W-8}" height="${Hh-8}" rx="54" fill="none" stroke="#2c2a27" stroke-width="2"/>
 <g clip-path="url(#scr)"><rect x="14" y="14" width="${W-28}" height="${Hh-28}" fill="${C.manteiga}"/><rect x="14" y="14" width="${W-28}" height="${Hh-28}" fill="${C.manteiga}" filter="url(#gp)"/>
 <text x="40" y="58" class="ui" font-size="15" font-weight="600" fill="${C.carvao}">9:41</text><rect x="${W/2-58}" y="26" width="116" height="34" rx="17" fill="#0E0D0C"/>
 ${wm(C.carvao,36,128,.27)}${tile(C.bordo,C.manteiga,W-36-40,88,.2)}
 <line x1="36" x2="${W-36}" y1="156" y2="156" stroke="${C.carvao}" stroke-width="1.4"/>
 <text x="36" y="180" class="mono" font-size="10.5" fill="${C.carvao}" letter-spacing="1.2">CORTE DO DIA · Nº 042</text><text x="${W-36}" y="180" text-anchor="end" class="mono" font-size="10.5" fill="${C.carvao}" letter-spacing="1.2">BR · AR · UY · US</text>
 <rect x="36" y="196" width="${W-72}" height="250" fill="${C.bordo}"/>
 <g transform="translate(${W/2},300)">${cutShape(C.manteiga,1.15)}</g>
 <text x="52" y="414" class="disp" font-size="38" fill="${C.manteiga}">Picanha</text>
 <text x="52" y="434" class="mono" font-size="10" fill="${C.manteiga}" opacity=".8" letter-spacing="1">TAPA DE CUADRIL · RUMP CAP</text>
 <text x="${W-52}" y="414" text-anchor="end" class="mono" font-size="12" fill="${C.manteiga}">1,2 kg</text>
 <text x="36" y="482" class="mono" font-size="10.5" fill="${C.carvao}" letter-spacing="1.2">CALCULADORA</text>
 <rect x="36" y="494" width="${W-72}" height="112" fill="none" stroke="${C.carvao}" stroke-width="1.4"/>
 <text x="52" y="556" class="disp" font-size="54" fill="${C.carvao}">12</text><text x="112" y="534" class="ui" font-size="13" fill="${C.carvao}">pessoas</text><text x="112" y="552" class="ui" font-size="13" fill="${C.carvao}" opacity=".6">8 adultos · 4 crianças</text>
 <line x1="36" x2="${W-36}" y1="572" y2="572" stroke="${C.carvao}" stroke-width=".8"/>
 <text x="52" y="594" class="mono" font-size="11" fill="${C.carvao}">TOTAL</text><text x="${W-52}" y="594" text-anchor="end" class="mono" font-size="14" font-weight="600" fill="${C.bordo}">4,800 kg</text>
 ${['Fraldinha','Ancho','Costela'].map((n,i)=>`<g transform="translate(36,${628+i*44})"><line x1="0" x2="${W-72}" y1="0" y2="0" stroke="${C.osso}"/><text x="0" y="28" class="ui" font-size="16" font-weight="600" fill="${C.carvao}">${n}</text><text x="${W-72}" y="28" text-anchor="end" class="mono" font-size="11" fill="${C.carvao}" opacity=".7">${['VACÍO','OJO DE BIFE','ASADO'][i]}  →</text></g>`).join('')}
 <rect x="14" y="${Hh-92}" width="${W-28}" height="78" fill="${C.carvao}"/>
 ${['Cortes','Mapa','Cálculo','Lista'].map((n,i)=>`<text x="${50+i*(W-100)/3}" y="${Hh-50}" text-anchor="middle" class="ui" font-size="11" font-weight="600" fill="${i==0?C.manteiga:'#8c857a'}" letter-spacing=".5">${n.toUpperCase()}</text>${i==0?`<rect x="${50-12}" y="${Hh-40}" width="24" height="3" fill="${C.brasa}"/>`:''}`).join('')}
 <rect x="${W/2-67}" y="${Hh-30}" width="134" height="5" rx="2.5" fill="${C.manteiga}" opacity=".7"/></g>`;
 return `<svg viewBox="0 0 ${W} ${Hh}" class="mock-phone">${g}</svg>`;}
// abstract cut silhouette (picanha: a geometric cap, built from arcs, w/ fat cap band)
function cutShape(col,s=1){return `<g transform="scale(${s})"><path d="M-110,30 C-104,-28 -40,-62 30,-58 C78,-55 108,-30 112,6 C114,26 100,40 80,42 L-96,46 C-106,46 -111,40 -110,30Z" fill="none" stroke="${col}" stroke-width="2.4"/><path d="M-98,24 C-88,-22 -36,-46 28,-44 C70,-42 96,-22 100,6" fill="none" stroke="${col}" stroke-width="1" stroke-dasharray="1 4"/>${[-60,-20,20,60].map(x=>`<line x1="${x}" x2="${x+14}" y1="40" y2="-30" stroke="${col}" stroke-width=".8" opacity=".55"/>`).join('')}</g>`;}
// ---------- apron
function apron(){let g=`<defs>${grain('ga',.28,.6)}<linearGradient id="ash" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".18" stop-color="#000" stop-opacity="0"/><stop offset=".82" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient></defs>
 <rect x="-300" y="-300" width="1200" height="1320" fill="#D9CDB4"/>
 <path d="M228,40 C236,120 250,150 250,150 M372,40 C364,120 350,150 350,150" stroke="#2b2622" stroke-width="10" fill="none" stroke-linecap="round"/>
 <path d="M220,150 L380,150 Q388,236 470,262 L486,690 Q300,708 114,690 L130,262 Q212,236 220,150Z" fill="${C.bordo}"/>
 <path d="M220,150 L380,150 Q388,236 470,262 L486,690 Q300,708 114,690 L130,262 Q212,236 220,150Z" fill="#000" filter="url(#ga)"/>
 <path d="M220,150 L380,150 Q388,236 470,262 L486,690 Q300,708 114,690 L130,262 Q212,236 220,150Z" fill="url(#ash)"/>
 <path d="M228,160 L372,160 Q380,244 460,270 L475,680 Q300,697 125,680 L140,270 Q220,244 228,160Z" fill="none" stroke="${C.manteiga}" stroke-opacity=".45" stroke-width="1.2" stroke-dasharray="5 4"/>
 <path d="M126,262 L60,300 M474,262 L540,300" stroke="#2b2622" stroke-width="10" stroke-linecap="round"/>
 <rect x="200" y="470" width="200" height="130" fill="none" stroke="${C.manteiga}" stroke-opacity=".45" stroke-width="1.2" stroke-dasharray="5 4"/>
 ${tile(C.manteiga,C.bordo,262,250,.38)}
 ${wm(C.manteiga,300-WW*.26/2,400,.26)}
 <text x="300" y="548" text-anchor="middle" class="mono" font-size="9" fill="${C.manteiga}" opacity=".7" letter-spacing="2">CASA DE CORTES</text>`;
 return `<svg viewBox="0 0 600 720" class="mock">${g}</svg>`;}
// ---------- butcher paper + scale label + inspection stamp
function wrap(){let g=`<defs>${grain('gw',.22,.75)}<filter id="sh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity=".25"/></filter>
 <filter id="ink"><feTurbulence baseFrequency="1.6" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="2.2"/><feComponentTransfer><feFuncA type="discrete" tableValues="0 .85 1 1 .9"/></feComponentTransfer></filter>
 <path id="circ" d="M0,-66 a66,66 0 1,1 -0.1,0"/></defs>
 <rect width="900" height="620" fill="#3a2a22"/>
 <rect x="-400" y="-400" width="1700" height="1400" fill="#3a2a22"/><g filter="url(#sh)"><path d="M90,90 L800,60 L830,540 L110,570Z" fill="#E9DCC0"/><path d="M90,90 L800,60 L830,540 L110,570Z" fill="#6b4a2a" filter="url(#gw)"/>
 <path d="M90,90 L460,330 L110,570" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="2"/><path d="M800,60 L460,330 L830,540" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/></g>
 <!-- twine -->
 <path d="M60,300 C300,318 600,290 880,318" stroke="#8a6a4a" stroke-width="5" fill="none"/><path d="M60,300 C300,318 600,290 880,318" stroke="#c9ad85" stroke-width="2" stroke-dasharray="3 3" fill="none"/>
 <!-- scale label -->
 <g transform="translate(470,150) rotate(-3)" filter="url(#sh)"><rect width="300" height="200" fill="#FBF8F1"/>
 <rect width="300" height="40" fill="${C.carvao}"/>${wm(C.manteiga,14,31,.155)}<text x="286" y="25" text-anchor="end" class="mono" font-size="9" fill="${C.manteiga}" letter-spacing="1.4">BALANÇA 03</text>
 <text x="14" y="64" class="mono" font-size="9" fill="${C.carvao}" letter-spacing="1.2">PRODUTO</text><text x="14" y="88" class="disp" font-size="24" fill="${C.carvao}">Fraldinha</text>
 <text x="14" y="104" class="mono" font-size="8.5" fill="${C.carvao}" opacity=".7" letter-spacing="1">VACÍO · FLAP · BR-17</text>
 <line x1="14" x2="286" y1="116" y2="116" stroke="${C.carvao}"/>
 ${[['PESO kg','1,240'],['R$/kg','64,90'],['TOTAL R$','80,48']].map((r,i)=>`<text x="${14+i*96}" y="132" class="mono" font-size="8" fill="${C.carvao}" letter-spacing="1">${r[0]}</text><text x="${14+i*96}" y="154" class="mono" font-size="${i==2?17:15}" font-weight="600" fill="${i==2?C.bordo:C.carvao}">${r[1]}</text>`).join('')}
 ${barcode(14,166,200,24,C.carvao)}<text x="226" y="186" class="mono" font-size="8" fill="${C.carvao}">EMB 26/11</text></g>
 <!-- inspection stamp -->
 <g transform="translate(250,400) rotate(-14)" filter="url(#ink)" fill="${C.violeta}" opacity=".88"><circle r="80" fill="none" stroke="${C.violeta}" stroke-width="4"/><circle r="56" fill="none" stroke="${C.violeta}" stroke-width="1.5"/>
 <text class="mono" font-size="11.5" font-weight="600" letter-spacing="4.2"><textPath href="#circ">CHURRASQUIN · CORTE INSPECIONADO · </textPath></text>
 <g transform="translate(-24,-30) scale(.24)"><path d="${QD}" transform="translate(-20,0)"/></g><text y="38" text-anchor="middle" class="mono" font-size="10" letter-spacing="2">Nº 042</text></g>
 ${tile(C.bordo,C.manteiga,150,140,.42)}`;
 return `<svg viewBox="0 0 900 620" class="mock">${g}</svg>`;}
// ---------- board engraved
function board(){let g=`<defs><linearGradient id="wd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9C6B43"/><stop offset=".5" stop-color="#8A5A36"/><stop offset="1" stop-color="#6E4528"/></linearGradient>
 <filter id="grainw"><feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="4" seed="3"/><feColorMatrix values="0 0 0 0 .25  0 0 0 0 .14  0 0 0 0 .06  0 0 0 .55 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
 <filter id="burn"><feTurbulence baseFrequency="1.2" numOctaves="2" seed="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.4"/><feGaussianBlur stdDeviation=".35"/></filter>
 <filter id="bsh" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="16" flood-opacity=".4"/></filter></defs>
 <rect x="-600" y="-200" width="2100" height="960" fill="#24201C"/>
 <g filter="url(#bsh)"><path d="M70,110 H700 a40,40 0 0 1 40,40 V180 H800 a60,60 0 0 1 0,120 H740 V410 a40,40 0 0 1 -40,40 H70 a40,40 0 0 1 -40,-40 V150 a40,40 0 0 1 40,-40Z" fill="url(#wd)"/></g>
 <path d="M70,110 H700 a40,40 0 0 1 40,40 V180 H800 a60,60 0 0 1 0,120 H740 V410 a40,40 0 0 1 -40,40 H70 a40,40 0 0 1 -40,-40 V150 a40,40 0 0 1 40,-40Z" fill="#fff" filter="url(#grainw)"/>
 <circle cx="800" cy="240" r="22" fill="#24201C"/>
 <path d="M70,112 H700" stroke="#fff" stroke-opacity=".15" stroke-width="2"/>
 <g filter="url(#burn)" opacity=".92">${wm('#3A2214',385-WW*.56/2,300,.56)}</g>
 <g filter="url(#burn)" opacity=".5"><text x="385" y="370" text-anchor="middle" class="mono" font-size="11" fill="#3A2214" letter-spacing="6">CASA DE CORTES</text></g>`;
 return `<svg viewBox="0 0 900 560" class="mock">${g}</svg>`;}
// ---------- stickers
function stickers(){let g=`<defs><filter id="ss" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity=".3"/></filter></defs>
 <rect x="-300" y="-300" width="1200" height="1200" fill="${C.osso}"/>
 <g transform="translate(150,170) rotate(-8)" filter="url(#ss)"><g transform="translate(-112,-112) scale(1.12)"><path d="${TILE}" fill="#fff" transform="translate(-14,-14) scale(1.14)"/>${sym(C.bordo,C.manteiga)}</g></g>
 <g transform="translate(400,330) rotate(6)" filter="url(#ss)"><rect x="-170" y="-58" width="340" height="116" rx="58" fill="#fff"/><rect x="-162" y="-50" width="324" height="100" rx="50" fill="${C.carvao}"/>${wm(C.manteiga,-WW*.3/2,10,.3)}</g>
 <g transform="translate(200,470) rotate(-4)" filter="url(#ss)"><circle r="78" fill="#fff"/><circle r="70" fill="${C.violeta}"/><circle r="60" fill="none" stroke="${C.manteiga}" stroke-width="1.2" stroke-dasharray="2 3"/><text y="-12" text-anchor="middle" class="disp" font-size="34" fill="${C.manteiga}">ao</text><text y="20" text-anchor="middle" class="disp" font-size="34" fill="${C.manteiga}">ponto</text><text y="42" text-anchor="middle" class="mono" font-size="8" letter-spacing="2" fill="${C.manteiga}">56°C · AR · UY</text></g>`;
 return `<svg viewBox="0 0 600 600" class="mock">${g}</svg>`;}
// ---------- social post
function post(){let g=`<defs>${grain('gs',.12)}</defs><rect width="1080" height="1080" fill="${C.bordo}"/><rect width="1080" height="1080" fill="#000" filter="url(#gs)"/>
 <text x="80" y="120" class="mono" font-size="26" fill="${C.manteiga}" letter-spacing="5">CALCULADORA · Nº 12</text>${tile(C.manteiga,C.bordo,920,70,.4)}
 <line x1="80" x2="1000" y1="170" y2="170" stroke="${C.manteiga}" stroke-width="3"/>
 <text x="72" y="520" class="disp" font-size="360" fill="${C.manteiga}" letter-spacing="-12">12</text>
 <text x="560" y="380" class="disp" font-size="76" fill="${C.manteiga}">pessoas,</text><text x="560" y="470" class="disp" font-size="76" fill="${C.manteiga}">4,8 kg.</text>
 <text x="80" y="640" class="serif" font-size="56" fill="${C.manteiga}" font-style="italic">Sem chute. Sem sobra.</text>
 <line x1="80" x2="1000" y1="720" y2="720" stroke="${C.manteiga}" stroke-width="1.5" opacity=".5"/>
 ${[['PICANHA','1,6'],['FRALDINHA','1,4'],['LINGUIÇA','1,0'],['CORAÇÃO','0,8']].map((r,i)=>`<text x="80" y="${780+i*44}" class="mono" font-size="24" fill="${C.manteiga}" letter-spacing="3">${r[0]}</text><text x="1000" y="${780+i*44}" text-anchor="end" class="mono" font-size="24" fill="${C.manteiga}">${r[1]} kg</text>`).join('')}
 ${wm(C.manteiga,80,1010,.42)}`;
 return `<svg viewBox="0 0 1080 1080" class="mock">${g}</svg>`;}
// home-screen row for 60px icon
function homeRow(){const ic=(x,col,lab,inner='')=>`<g transform="translate(${x},40)"><rect width="60" height="60" rx="13.5" fill="${col}"/>${inner}<text x="30" y="80" text-anchor="middle" class="ui" font-size="11" fill="#fff">${lab}</text></g>`;
 const s=60/1024,qs=1024/TS*.8*s;const qq=G.q().g.bounds;
 const brand=`<g transform="translate(${f((60-qq.width*qs)/2-8*s)},${f((60-qq.height*qs)/2+103*qs)}) scale(${f(qs)})"><path d="${G.q().g.pathData}" fill="${C.manteiga}"/></g>`;
 return `<svg viewBox="0 0 400 140" class="home"><defs><linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b3530"/><stop offset="1" stop-color="#151311"/></linearGradient></defs><rect width="400" height="140" rx="20" fill="url(#wall)"/>
 ${ic(22,'#4b4640','Agenda')}${ic(114,'#5a554e','Mapas')}${ic(206,C.bordo,'churrasquin',brand)}${ic(298,'#4b4640','Notas')}</svg>`;}

const files=['logo-horizontal','logo-vertical','simbolo'];
const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>churrasquin — Direção A · Açougue de Ofício</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
:root{--bordo:${C.bordo};--carvao:${C.carvao};--manteiga:${C.manteiga};--sebo:${C.sebo};--violeta:${C.violeta};--brasa:${C.brasa};--osso:${C.osso};--m:clamp(20px,5vw,72px)}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--manteiga);color:var(--carvao);font-family:Archivo,sans-serif;font-variation-settings:"wdth" 100;-webkit-font-smoothing:antialiased}
.mono,.lab{font-family:"IBM Plex Mono",monospace}.disp{font-family:Archivo;font-weight:800;font-stretch:72%;font-variation-settings:"wdth" 72}.ui{font-family:Archivo}.serif{font-family:"Instrument Serif",serif}
svg .lab{font-size:7px;fill:var(--violeta);letter-spacing:.06em}svg .lab.b{fill:var(--brasa)}
.wrap{padding:0 var(--m);max-width:1440px;margin:0 auto}
header.top{display:flex;justify-content:space-between;padding:22px var(--m);font:500 11px/1 "IBM Plex Mono";letter-spacing:.14em;text-transform:uppercase;border-bottom:1.5px solid var(--carvao)}
.hero{background:var(--bordo);color:var(--manteiga);padding:clamp(48px,9vw,140px) var(--m) clamp(28px,4vw,48px);position:relative}
.hero svg{width:100%;height:auto;display:block}
.hero .meta{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:clamp(40px,6vw,90px);border-top:1.5px solid var(--manteiga);padding-top:16px;font:400 11px/1.5 "IBM Plex Mono";letter-spacing:.1em;text-transform:uppercase}
.sec{padding:clamp(56px,8vw,120px) 0;border-bottom:1.5px solid var(--carvao)}
.sh{display:grid;grid-template-columns:120px 1fr;gap:24px;margin-bottom:clamp(28px,4vw,56px);align-items:baseline}
.sh .n{font:600 12px "IBM Plex Mono";letter-spacing:.12em}
h2{font-weight:800;font-variation-settings:"wdth" 70;font-size:clamp(40px,6.4vw,96px);line-height:.9;letter-spacing:-.01em;text-transform:lowercase}
.lead{font-family:"Instrument Serif";font-size:clamp(24px,2.6vw,38px);line-height:1.15;max-width:22ch}
p{font-size:16px;line-height:1.55;max-width:60ch}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,64px)}
.three{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.cap{font:400 11px/1.4 "IBM Plex Mono";letter-spacing:.1em;text-transform:uppercase;margin-top:10px;display:flex;justify-content:space-between;gap:12px}
.card img,.card svg{display:block;width:100%;height:auto}
.principles{display:grid;grid-template-columns:repeat(3,1fr);border-top:1.5px solid var(--carvao)}
.principles div{padding:22px 24px 8px 0}.principles b{display:block;font:600 12px "IBM Plex Mono";letter-spacing:.1em;margin-bottom:10px}
.constr{width:100%;height:auto;display:block}
.sizes{display:flex;align-items:flex-end;gap:36px;flex-wrap:wrap;padding:32px;background:var(--sebo)}
.sizes figure{display:flex;flex-direction:column;align-items:center;gap:10px;font:11px "IBM Plex Mono"}
.pal{display:grid;grid-template-columns:2.2fr 1.4fr 1.4fr 1fr 1fr 1fr;height:420px}
.pal div{padding:18px;display:flex;flex-direction:column;justify-content:space-between;font:400 11px/1.5 "IBM Plex Mono";letter-spacing:.06em}
.pal b{font:800 28px/1 Archivo;font-variation-settings:"wdth" 70;letter-spacing:0;text-transform:lowercase;display:block;margin-bottom:8px}
.type{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
.type>div{background:var(--sebo);padding:28px;min-height:300px;display:flex;flex-direction:column;justify-content:space-between}
.big{font-size:88px;line-height:1}
.mockgrid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px}
.mockgrid .card{background:var(--sebo)}
.mock,.mock-phone{display:block;width:100%;height:auto}
.lk{aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 1px rgba(27,25,22,.12)}
.mockgrid{grid-auto-rows:auto}.box{height:600px;overflow:hidden;position:relative}.box>svg{width:100%;height:100%;display:block}
.phonebox{height:600px;padding:28px 0}.phonebox svg{height:100%;width:auto}
.phonebox{background:var(--osso);display:flex;justify-content:center;align-items:center;padding:48px 0}
.phonebox svg{width:min(78%,360px)}
.dont{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.dont div{background:var(--sebo);padding:18px;position:relative}
.dont>div:after{content:"";position:absolute;inset:0;background:linear-gradient(to top right,transparent calc(50% - 1px),var(--brasa) 50%,transparent calc(50% + 1px))}
footer{padding:48px var(--m);display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;font:11px "IBM Plex Mono";letter-spacing:.1em;text-transform:uppercase}
@media(max-width:820px){.box{height:auto!important}.box>svg{height:auto}.cap{flex-direction:column;gap:2px}header.top span:nth-child(2){display:none}.box,.phonebox{height:440px}.lk{aspect-ratio:16/10}.cols,.three,.type,.principles{grid-template-columns:1fr}.sh{grid-template-columns:1fr;gap:8px}.hero .meta{grid-template-columns:1fr 1fr}
.pal{grid-template-columns:1fr 1fr;height:auto}.pal div{min-height:150px}.mockgrid{grid-template-columns:1fr}.mockgrid .card{grid-column:auto!important}.dont{grid-template-columns:1fr 1fr}.big{font-size:64px}}
</style></head><body>
<header class="top"><span>churrasquin</span><span>Direção A — Açougue de Ofício</span><span>Rodada 02</span></header>
<section class="hero"><svg viewBox="-4 -156 ${WW+8} 214">${wm(C.manteiga)}</svg>
<div class="meta"><span>Lettering proprietário<br>11 glifos desenhados</span><span>Corte de faca<br>30° em toda entrada</span><span>Símbolo<br>o gancho do q</span><span>Sem fonte<br>100% vetor</span></div></section>

<div class="wrap">
<section class="sec"><div class="sh"><span class="n">01 — CONCEITO</span><h2>o balcão, não a fogueira.</h2></div>
<div class="cols"><p class="lead">Churrasco bom começa antes do fogo: no balcão, com quem sabe cortar.</p>
<div><p>A rodada anterior falava de fumaça e brasa, como todo mundo do setor. Esta direção sai da churrasqueira e vai para o <b>balcão da casa de carnes</b>: a faca que corta em ângulo, o gancho onde a peça fica pendurada, a etiqueta da balança, o carimbo violeta da inspeção, o papel manteiga. É desse vocabulário que vêm as formas da marca, mas nada aqui é enfeite: cada ideia virou <b>regra de desenho</b>.</p><br>
<p>O resultado é um lettering estreito e pesado, parente do letreiro pintado à mão, construído numa grade de 10 unidades. Ele é reconhecível pela forma das letras, não por um ícone colado ao lado.</p></div></div>
<div class="principles" style="margin-top:56px"><div><b>I · O CORTE</b><p>Toda haste começa num corte de 30°, o ângulo de uma faca de açougueiro. A mesma inclinação abre o <i>c</i>, fecha o <i>s</i> e define o pingo do <i>i</i>.</p></div><div><b>II · O GANCHO</b><p>O <i>q</i> de “quin”, o diminutivo carinhoso, desce e vira gancho de pendurar carne. É o único gesto curvo abaixo da linha de base, e é ali que mora o símbolo.</p></div><div><b>III · A ETIQUETA</b><p>O símbolo fica numa placa de cantos entalhados (r24), a forma da etiqueta de balança e do cartão de preço do balcão.</p></div></div></section>

<section class="sec"><div class="sh"><span class="n">02 — LETTERING</span><h2>desenhado, não digitado.</h2></div>
${constrWord()}
<div class="cap"><span>Haste 26 · horizontal 21 (contraste óptico de 0,81)</span><span>Bojos superelípticos r34/r12 · overshoot de 3</span><span>Espaçamento ajustado par a par: rr −1 · ra −3</span></div>
<div class="cols" style="margin-top:48px"><div><p>Os 11 glifos foram desenhados como geometria (bojos superelípticos, hastes, cortes) e fundidos com operações booleanas num único contorno. Não há nenhuma fonte instalada no arquivo. As horizontais são 19% mais finas que as verticais para compensar a ilusão óptica de peso, e as partes curvas passam 3 unidades da altura-x e da linha de base para parecerem do mesmo tamanho das retas.</p></div>
<div><p>O que torna a palavra inconfundível: o <b>a</b> e o <b>q</b> têm o ombro direito reto, como uma peça encostada na tábua. O <b>s</b> tem a espinha horizontal e dois cortes paralelos. O pingo do <b>i</b> é um paralelogramo cortado a 30°, uma fatia. E o <b>q</b> termina num gancho. Pelo menos quatro dessas letras você reconhece mesmo sem ler o resto.</p></div></div></section>

<section class="sec"><div class="sh"><span class="n">03 — SÍMBOLO</span><h2>o gancho na etiqueta.</h2></div>
<div class="cols"><div>${constrSym()}</div>
<div style="display:flex;flex-direction:column;justify-content:space-between;gap:24px"><p>O <i>q</i> do lettering, ampliado em 112%, dentro de uma placa quadrada de 200 unidades com entalhes de raio 24 (12% do lado). O gancho segue um raio de 36, centrado no eixo da haste. Ele foi deslocado 4 unidades para a esquerda para equilibrar o peso do bojo, porque o centro geométrico não coincide com o centro óptico.</p>
<div class="sizes">${[16,24,32,48,96].map(s=>`<figure><img src="simbolo-pos.svg" width="${s}" height="${s}" alt=""><span>${s}px</span></figure>`).join('')}<figure><img src="simbolo-neg.svg" width="16" height="16" alt=""><span>16 neg</span></figure></div></div></div></section>

<section class="sec"><div class="sh"><span class="n">04 — ASSINATURAS</span><h2>horizontal, vertical, símbolo.</h2></div>
${['pos','neg','mono'].map(k=>`<div class="three" style="margin-bottom:16px">${files.map(fn=>`<div class="card"><div class="lk" style="background:${V[k].bg}"><img src="${fn}-${k}.svg" alt="" style="width:${{'logo-horizontal':86,'logo-vertical':62,simbolo:40}[fn]}%"></div><div class="cap"><span>${fn.replace('logo-','')}</span><span>${{pos:'positiva',neg:'negativa',mono:'monocromática'}[k]}</span></div></div>`).join('')}</div>`).join('')}
<p style="margin-top:24px">Área de proteção: a largura de uma haste ×2 (52 unidades) em todos os lados. Tamanho mínimo da assinatura horizontal: 96 px ou 22 mm. Abaixo disso, use só o símbolo.</p></section>

<section class="sec"><div class="sh"><span class="n">05 — ÍCONE</span><h2>app icon.</h2></div>
<div class="cols" style="align-items:center"><div class="card"><img src="app-icon-1024.svg" alt="" style="border-radius:22.37%;max-width:440px"><div class="cap"><span>1024 × 1024 · máscara do sistema</span><span>app-icon-1024.svg</span></div></div>
<div>${homeRow()}<div class="cap"><span>Em 60 px, na tela inicial</span></div><p style="margin-top:24px">No ícone, a etiqueta sai e quem faz a moldura é a máscara do sistema. O <i>q</i> fica a 80% do campo, alinhado pelo bojo, e é a forma bordô mais fácil de achar numa tela cheia de ícones azuis e verdes.</p></div></div></section>

<section class="sec"><div class="sh"><span class="n">06 — COR</span><h2>paleta de balcão.</h2></div>
<div class="pal">
<div style="background:var(--bordo);color:var(--manteiga)"><div><b>bordô açougue</b>Cor-assinatura. Placas, ícone, embalagem, fundos de destaque.</div><span>${C.bordo}<br>PANTONE 7623 C aprox.</span></div>
<div style="background:var(--carvao);color:var(--manteiga)"><div><b>carvão</b>Texto e lettering. É o preto da marca, nunca #000.</div><span>${C.carvao}</span></div>
<div style="background:var(--manteiga);box-shadow:inset 0 0 0 1.5px var(--carvao)"><div><b>papel manteiga</b>O fundo. Quente, fosco, de papel.</div><span>${C.manteiga}</span></div>
<div style="background:var(--violeta);color:var(--manteiga)"><div><b>tinta de carimbo</b>O violeta da inspeção. Só em selos, estados e dados.</div><span>${C.violeta}</span></div>
<div style="background:var(--brasa);color:var(--carvao)"><div><b>brasa</b>Ação e alerta. No máximo 5% da área.</div><span>${C.brasa}</span></div>
<div style="background:var(--osso)"><div><b>osso</b>Fios, divisórias, apoio.</div><span>${C.osso}</span></div></div>
<div class="cap"><span>Proporção de uso: manteiga 55 · carvão 20 · bordô 18 · osso 4 · violeta 2 · brasa 1</span><span>Carvão sobre manteiga 15,1:1 · manteiga sobre bordô 9,4:1</span></div></section>

<section class="sec"><div class="sh"><span class="n">07 — TIPOGRAFIA</span><h2>tipografia de apoio.</h2></div>
<div class="type"><div><span class="cap" style="margin:0"><span>Títulos · Google Fonts</span></span><div class="disp big">Archivo<br>Condensed</div><p style="font-size:13px">Archivo variável, wdth 62–75, peso 800. Uma grotesca estreita que conversa com o lettering sem competir com ele. Nomes de cortes e números grandes.</p></div>
<div><span class="cap" style="margin:0"><span>Dados · Google Fonts</span></span><div class="mono big" style="font-size:54px;line-height:1.1">1,240 kg<br>R$ 64,90</div><p style="font-size:13px">IBM Plex Mono 400/600. A voz da etiqueta de balança: pesos, preços, códigos e nomes de cortes em AR, UY e US. Sempre em caixa-alta, com espaçamento de +0,1 em.</p></div>
<div><span class="cap" style="margin:0"><span>Voz · Google Fonts</span></span><div class="serif big" style="font-style:italic">Sem chute.<br>Sem sobra.</div><p style="font-size:13px">Instrument Serif itálica, só para frases curtas de tom editorial e de conversa. Nunca em interface funcional.</p></div></div></section>

<section class="sec"><div class="sh"><span class="n">08 — APLICAÇÕES</span><h2>do app ao balcão.</h2></div>
<div class="mockgrid">
<div class="card" style="grid-column:span 5"><div class="phonebox">${phone()}</div><div class="cap" style="padding:0 14px 14px"><span>App · tela inicial</span><span>Corte do dia + calculadora</span></div></div>
<div class="card" style="grid-column:span 7"><div class="box">${wrap().replace('class="mock"','preserveAspectRatio="xMidYMid slice"')}</div><div class="cap" style="padding:0 14px 14px"><span>Papel manteiga · etiqueta de balança · carimbo de inspeção</span></div></div>
<div class="card" style="grid-column:span 4"><div class="box">${apron().replace('class="mock"','preserveAspectRatio="xMidYMid slice"')}</div><div class="cap" style="padding:0 14px 14px"><span>Avental · lona encerada</span></div></div>
<div class="card" style="grid-column:span 4"><div class="box" style="background:${C.osso}">${stickers().replace(`class="mock"`,`preserveAspectRatio="xMidYMid meet"`)}</div><div class="cap" style="padding:0 14px 14px"><span>Adesivos recortados</span></div></div>
<div class="card" style="grid-column:span 4"><div class="box" style="background:${C.bordo};display:flex;align-items:center">${post()}</div><div class="cap" style="padding:0 14px 14px"><span>Post · 1080 × 1080</span></div></div>
<div class="card" style="grid-column:span 12"><div class="box">${board().replace('class="mock"','preserveAspectRatio="xMidYMid slice"')}</div><div class="cap" style="padding:0 14px 14px"><span>Tábua de parrilla · gravação a laser</span></div></div>
</div></section>

<section class="sec"><div class="sh"><span class="n">09 — NÃO FAZER</span><h2>proteção.</h2></div>
<div class="dont">
<div><svg viewBox="-10 -160 ${WW+20} 223"><path d="${WD}" fill="${C.carvao}" transform="scale(1.25,1) translate(-80,0)"/></svg><div class="cap"><span>Não distorcer</span></div></div>
<div><svg viewBox="-10 -160 ${WW+20} 223"><path d="${WD}" fill="${C.brasa}"/></svg><div class="cap"><span>Não usar brasa no lettering</span></div></div>
<div><svg viewBox="-10 -160 ${WW+20} 223"><path d="${WD}" fill="none" stroke="${C.carvao}" stroke-width="3"/></svg><div class="cap"><span>Não usar só o contorno</span></div></div>
<div><svg viewBox="-10 -160 ${WW+20} 223"><text x="0" y="0" font-family="Archivo" font-weight="800" font-size="170" style="font-variation-settings:'wdth' 62" fill="${C.carvao}">churrasquin</text></svg><div class="cap"><span>Não redigitar com fonte</span></div></div>
</div></section>
</div>
<footer><span>churrasquin · Direção A · Açougue de Ofício</span><img src="simbolo-pos.svg" width="28" height="28" alt=""><span>Arquivos: logo-*.svg · simbolo-*.svg · app-icon-1024.svg</span></footer>
</body></html>`;
fs.writeFileSync(OUT+'index.html',html);
fs.writeFileSync(OUT+'app-tela.svg',`<svg xmlns="http://www.w3.org/2000/svg"`+phone().slice(4));
