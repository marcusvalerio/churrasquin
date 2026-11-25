const ot=require('opentype.js'),fs=require('fs');
const f=ot.parse(fs.readFileSync(__dirname+'/Shrikhand.ttf').buffer);
const TRACK=-28;
// drip: x center, w width, L length below baseline, r fillet
function drip(x,w,L,r,top=-14){const a=x-w/2,b=x+w/2,Rb=w*0.6,yb=L-Rb;
 return `M${x} ${top-60}L${a-r} ${top-60}L${a-r} ${top}Q${a} ${top+2} ${a} ${top+r}L${a} ${yb-Rb*1.6}C${a} ${yb-Rb*0.9} ${x-Rb} ${yb-Rb*0.8} ${x-Rb} ${yb}A${Rb} ${Rb} 0 0 0 ${x+Rb} ${yb}C${x+Rb} ${yb-Rb*0.8} ${b} ${yb-Rb*0.9} ${b} ${yb-Rb*1.6}L${b} ${top+r}Q${b} ${top+2} ${b+r} ${top}L${b+r} ${top-60}Z`;}
// teardrop (falling drop), center cx, cy of round part, radius R, tip up
function drop(cx,cy,R,h){return `M${cx} ${cy-h}C${cx+R*0.35} ${cy-h+R*0.9} ${cx+R} ${cy-R*0.55} ${cx+R} ${cy}A${R} ${R} 0 0 1 ${cx-R} ${cy}C${cx-R} ${cy-R*0.55} ${cx-R*0.35} ${cy-h+R*0.9} ${cx} ${cy-h}Z`;}
const DR={a:[[163,124,500,34]],u2:[[183,124,330,34]]};
function wordmark(){let x=0,d='',e='';
 let ui=0;for(const ch of 'churrasquin'){const key=ch==='u'?(++ui===2?'u2':'u'):ch;const g=f.charToGlyph(ch);let p=g.getPath(x,0,1000);
  let pd=p.toPathData(1);
  if(ch==='i'){ // drop the tittle, add a falling drop
    const subs=pd.split(/(?=M)/);const keep=subs.filter(s=>{const ys=[...s.matchAll(/-?\d+\.?\d*/g)].map(m=>+m[0]).filter((v,i)=>i%2==1);return Math.min(...ys)>-560;});
    pd=keep.join('');d+=pd;e+=drop(x+268,-650,98,215);
  } else d+=pd;
  for(const [dx,w,L,r] of (DR[key]||[])) e+=drip(x+dx,w,L,r);
  x+=g.advanceWidth+TRACK;}
 return {d:d,e:e,width:x-TRACK,svg:(fill)=>`<path fill="${fill}" d="${d}"/><path fill="${fill}" d="${e}"/>`};}
module.exports={wordmark,drip,drop};
if(require.main===module){const W=wordmark(),width=W.width;fs.writeFileSync(__dirname+'/wm.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-80 -900 ${width+160} 1450" width="1400"><rect x="-80" y="-900" width="${width+160}" height="1450" fill="#2433FF"/>${W.svg("#FF4F8B")}<line x1="-80" x2="${width}" y1="0" y2="0" stroke="#fff" stroke-width="2"/></svg>`);}
