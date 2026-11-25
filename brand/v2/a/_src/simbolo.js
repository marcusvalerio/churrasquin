// Símbolo v3 + explorações. Grade 200, módulo 20, corte de faca a 30°.
const {P,U,rect,poly,T}=require('./glyphs.js');
const A=Math.PI/6, f=n=>+n.toFixed(2);
// faixa (kerf) de largura k ao longo de uma reta a 30° que passa por (x0,y0)
const kerf=(x0,y0,k,ang=-30,L=600)=>{const a=ang*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a),nx=-dy*k/2,ny=dx*k/2;
 return poly([[x0-dx*L+nx,y0-dy*L+ny],[x0+dx*L+nx,y0+dy*L+ny],[x0+dx*L-nx,y0+dy*L-ny],[x0-dx*L-nx,y0-dy*L-ny]]);};
const vk=(x,k)=>rect(x-k/2,-300,k,800);
const pd=g=>g.pathData;
// ---------- EXPLORAÇÕES ----------
const X={};
// 01 Mapa de corte: bloco 200 partido em 5 peças; a peça escolhida desliza ao longo da faca.
X.mapa=(K=18,pull=26)=>{const B=rect(0,0,200,200);const vx=80;
 const left=B.intersect(rect(0,0,vx-K/2,200)), right=B.intersect(rect(vx+K/2,0,200,200));
 // esquerda: um corte a 30° (y=140 em x=0)
 const yl=100+vx*T; // o corte da esquerda continua o mesmo golpe de faca da direita
 const lc=kerf(0,yl,K); const lTop=left.subtract(lc).subtract(poly([[0,yl],[300,yl-300*T],[300,400],[0,400]]));
 const lBot=left.subtract(lc).intersect(poly([[0,yl],[300,yl-300*T],[300,400],[0,400]]));
 // direita: dois cortes paralelos
 const y1=100,y2=180; const H1=poly([[vx,y1],[vx+300,y1-300*T],[vx+300,-400],[vx,-400]]);
 const H2=poly([[vx,y2],[vx+300,y2-300*T],[vx+300,-400],[vx,-400]]);
 const r=right.subtract(kerf(vx,y1,K)).subtract(kerf(vx,y2,K));
 const rTop=r.intersect(H1), rMid=r.intersect(H2).subtract(H1), rBot=r.subtract(H2);
 const m=rMid.clone(); m.translate(new P.Point(Math.cos(A)*pull,-Math.sin(A)*pull));
 return {rest:U(lTop,lBot,rTop,rBot),pick:m,lines:[[0,yl],[vx,y1],[vx,y2]],vx};};
// 02 Fatias: bloco fatiado a 30° em 4 porções iguais (a turma), abertas em leque
X.fatias=()=>{let out=[];for(let i=0;i<4;i++){const y=60+i*50;let s=rect(0,0,200,200).intersect(poly([[0,y-50],[400,y-50-400*T],[400,y-400*T],[0,y]]));
 s=s.subtract(kerf(0,y,14));s.translate(new P.Point(i*6,i*4));out.push(s);}return {rest:U(...out)};};
// 03 Pingo do i: a fatia-paralelogramo do i como botão de informação
X.pingo=()=>{const c=new P.Path.Circle(new P.Point(100,100),100);const st=rect(87,92,26,64).subtract(poly([[85,92+26*T],[115,92],[115,80],[85,80]]));
 const dot=poly([[87,48+26*T],[113,48],[113,78-26*T],[87,78]]);return {rest:c.subtract(st).subtract(dot)};};
// 04 Roda da turma: tábua redonda em 6 porções, uma servida
X.roda=()=>{const c=new P.Path.Circle(new P.Point(100,100),100);let g=c;for(let a=0;a<180;a+=60)g=g.subtract(kerf(100,100,14,a+30));
 const wedge=poly([[100,100],[100+300*Math.cos(-Math.PI/6*3),100+300*Math.sin(-Math.PI/6*3)],[100+300*Math.cos(-Math.PI/6),100+300*Math.sin(-Math.PI/6)]]);
 const pick=g.intersect(wedge);const rest=g.subtract(wedge);pick.translate(new P.Point(10,-14));return {rest,pick};};
// 05 Mesa: tábua longa com lugares a 30° dos dois lados (a turma em volta)
X.mesa=()=>{let g=rect(70,10,60,180);let seats=[];for(let i=0;i<3;i++){for(const s of [-1,1]){const y=30+i*60;const x=s<0?20:150;
 seats.push(poly([[x,y+30*T],[x+30,y],[x+30,y+40-30*T],[x,y+40]]));}}return {rest:U(g,...seats)};};
// 06 Contracorte: um bife em corte transversal, capa de gordura separada pela faca
X.capa=()=>{const base=new P.Path.Rectangle(new P.Rectangle(0,20,200,160),new P.Size(40,40));const cap=base.intersect(poly([[0,-100],[300,-100],[300,60-300*T],[0,60]]));
 const meat=base.subtract(poly([[0,-100],[300,-100],[300,60-300*T+18],[0,78]]));return {rest:meat,pick:cap};};
// 07 Etiqueta-mapa: a placa entalhada com o mapa por dentro (ponte com a rodada anterior)
X.etiqueta=()=>{let t=rect(0,0,200,200);for(const [x,y] of [[0,0],[200,0],[0,200],[200,200]])t=t.subtract(new P.Path.Circle(new P.Point(x,y),24));
 const m=X.mapa(14,0);const s=1/1.6;const inner=U(m.rest,m.pick);inner.scale(s,new P.Point(0,0));inner.translate(new P.Point(100-100*s,100-100*s));return {rest:t.subtract(inner)};};
// 08 Gancho+mapa: a peça escolhida pendurada no gancho do q
X.gancho=()=>{const m=X.mapa(16,0);const p=m.pick.clone();const rest=m.rest.clone();rest.scale(.78,new P.Point(0,200));
 p.scale(.78,new P.Point(0,200));p.translate(new P.Point(44,-70));const b=p.bounds;const cx=b.center.x,top=b.top+18;
 const hk=new P.Path.Circle(new P.Point(cx,top-22),22).subtract(new P.Path.Circle(new P.Point(cx,top-22),9)).subtract(rect(cx-30,top-22,30,30)).unite(rect(cx-5,top-22,10,24));
 return {rest:U(rest,hk),pick:p};};
const NAMES=[['mapa','Mapa de corte','5 peças, a escolhida desliza na linha da faca'],['fatias','Fatias','4 porções iguais a 30°, abertas em leque'],['pingo','Pingo do i','a fatia do i vira botão de informação'],['roda','Roda da turma','tábua redonda em 6, uma servida'],['mesa','Mesa posta','tábua com 6 lugares em volta'],['capa','Capa de gordura','corte transversal, a faca separa a capa'],['etiqueta','Etiqueta-mapa','placa r24 com o mapa vazado'],['gancho','Peça no gancho','a peça escolhida pendurada no q']];
module.exports={X,NAMES,kerf,f,pd};
