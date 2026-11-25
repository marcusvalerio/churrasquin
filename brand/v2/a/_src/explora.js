const fs=require('fs');const {X,NAMES,pd}=require('./simbolo.js');
const C={bordo:'#7A1C1C',carvao:'#1B1916',manteiga:'#EFE6D3',sebo:'#F8F3E8',violeta:'#56408A',brasa:'#D6502B',osso:'#CBBDA0'};
const one=(k,col,pk)=>{const s=X[k]();return `<path d="${pd(s.rest)}" fill="${col}"/>`+(s.pick?`<path d="${pd(s.pick)}" fill="${pk||col}"/>`:'');};
let g=`<rect width="1680" height="1060" fill="${C.sebo}"/><text x="60" y="70" font-family="IBM Plex Mono, Menlo, Consolas, monospace" font-size="14" letter-spacing="3" fill="${C.carvao}">CHURRASQUIN · DIREÇÃO A · SÍMBOLO — 8 EXPLORAÇÕES · GRADE 200 · FACA 30°</text>`;
NAMES.forEach(([k,t,d],i)=>{const x=60+(i%4)*400,y=110+Math.floor(i/4)*470;const chosen=k=='mapa';
 g+=`<g transform="translate(${x},${y})"><rect width="380" height="440" fill="${chosen?C.manteiga:'#fff'}" stroke="${chosen?C.bordo:C.osso}" stroke-width="${chosen?3:1}"/>`;
 for(let j=0;j<=10;j++)g+=`<line x1="${90+j*20}" x2="${90+j*20}" y1="30" y2="230" stroke="${C.osso}" stroke-width=".4"/><line y1="${30+j*20}" y2="${30+j*20}" x1="90" x2="290" stroke="${C.osso}" stroke-width=".4"/>`;
 g+=`<g transform="translate(90,30)">${one(k,C.bordo)}</g>`;
 // reduções: 60, 32, 16 e negativo
 g+=`<rect x="20" y="262" width="340" height="96" fill="${C.carvao}"/><g transform="translate(36,280) scale(.3)">${one(k,C.manteiga)}</g><g transform="translate(120,294) scale(.16)">${one(k,C.manteiga)}</g><g transform="translate(176,302) scale(.08)">${one(k,C.manteiga)}</g>`;
 g+=`<rect x="220" y="272" width="76" height="76" rx="17" fill="${C.bordo}"/><g transform="translate(232,284) scale(.26)">${one(k,C.manteiga)}</g>`;
 g+=`<text x="20" y="392" font-family="IBM Plex Mono, Menlo, Consolas, monospace" font-size="12" letter-spacing="2" fill="${C.carvao}">0${i+1} · ${t.toUpperCase()}${chosen?'  ✓ ESCOLHIDO':''}</text><text x="20" y="416" font-family="IBM Plex Mono, Menlo, Consolas, monospace" font-size="11" fill="${C.carvao}" opacity=".7">${d}</text></g>`;});
fs.writeFileSync('/home/user/churrasquin/brand/v2/a/simbolo-exploracoes.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1680 1060">${g}</svg>`);
