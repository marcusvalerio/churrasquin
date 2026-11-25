const paper=require('paper');paper.setup(new paper.Size(2000,2000));
const P=paper;const T=Math.tan(30*Math.PI/180);
const S=26,H=21,X=100,O=3,ASC=-150;
function rr(x,y,w,h,r,k=0.70){r=Math.min(r,w/2,h/2);const c=r*k;const p=new P.Path({closed:true});
 const segs=[[x+r,y,[-c,0],[0,0]],[x+w-r,y,[0,0],[c,0]],[x+w,y+r,[0,-c],[0,0]],[x+w,y+h-r,[0,0],[0,c]],[x+w-r,y+h,[c,0],[0,0]],[x+r,y+h,[0,0],[-c,0]],[x,y+h-r,[0,c],[0,0]],[x,y+r,[0,0],[0,-c]]];
 segs.forEach(s=>p.add(new P.Segment(new P.Point(s[0],s[1]),new P.Point(s[2]),new P.Point(s[3]))));return p;}
const rect=(x,y,w,h)=>new P.Path.Rectangle(new P.Rectangle(x,y,w,h));
const poly=pts=>new P.Path({segments:pts,closed:true});
const U=(...a)=>a.reduce((m,b)=>m.unite(b));
const knife=(x0,top,w=S,e=2)=>poly([[x0-2,top-20],[x0+w+e,top-20],[x0+w+e,top-T*e],[x0-2,top+(w+2)*T]]); // removes wedge above 30deg line from (x0,top+w*T) to (x0+w,top)
const RO=34,RI=12;
function nBase(W,top=-X){let g=U(rr(0,-X-O,W,200,RO),rect(0,top,S,-top+40),rect(0,-X,W/2,140)).intersect(rect(-5,-300,W+10,300));return g.subtract(rr(S,-X-O+H,W-2*S,200,RI));}
const G={};
G.n=()=>({g:nBase(70).subtract(knife(0,-X,S,14)),w:70});
G.h=()=>({g:nBase(70,ASC).subtract(knife(0,ASC)),w:70});
G.u=()=>{let g=nBase(70);g.rotate(180,new P.Point(35,-50));return {g:g.subtract(knife(0,-X)).subtract(knife(70-S,-X)),w:70};};
G.r=()=>{const W=60;let g=nBase(W);const y=-70,xs=S+7;
 g=g.subtract(poly([[xs,y+T*(W-xs)],[W+8,y-T*8],[W+8,10],[xs,10]]));return {g:g.subtract(knife(0,-X,S,14)),w:W-3};};
function bowl(W){let g=U(rr(0,-X-O,W,X+2*O,RO),rect(W/2,-X-O,W/2,X+O));return g.subtract(rr(S,-X-O+H,W-2*S,X+2*O-2*H,RI));}
G.a=()=>({g:bowl(68),w:68});
G.q=()=>{const W=68,R=36,hs=26,cy=22,cx=W-S+R;let g=bowl(68);
 let hk=new P.Path.Circle(new P.Point(cx,cy),R).subtract(new P.Path.Circle(new P.Point(cx,cy),R-hs)).intersect(rect(cx-R-1,cy,2*R+2,R+2));
 const tx=cx+R-hs,ty=cy-15; let tip=rect(tx,ty,hs,16).subtract(knife(tx,ty,hs));
 g=U(g,rect(W-S,-10,S,cy+11),hk,tip);return {g,w:W};};
G.c=()=>{const W=64;let g=rr(0,-X-O,W,X+2*O,RO).subtract(rr(S,-X-O+H,W-2*S,X+2*O-2*H,RI));
 const xa=S+4,yt=-66,yb=-31; g=g.subtract(poly([[xa,yt],[W+20,yt-T*(W+20-xa)],[W+20,yb-T*(W+20-xa)],[xa,yb]]));return {g,w:W};};
G.s=()=>{const W=62,Ss=24,top=-X-O,bot=O,sp=-60.5,sp2=-39.5;
 let g=rr(0,top,W,bot-top,28);
 g=g.subtract(rr(Ss,top+H,W-2*Ss,sp-(top+H),6)).subtract(rr(Ss,sp2,W-2*Ss,bot-H-sp2,6));
 const cut=poly([[W-Ss-6,-80+T*(Ss+1)],[W+6,-80-T*6],[W+6,sp],[W-Ss-6,sp]]);const cut2=cut.clone();cut2.rotate(180,new P.Point(W/2,-50));
 g=g.subtract(cut).subtract(cut2);return {g:U(g,rect(0,sp,W,H)),w:W};};
G.i=()=>{let g=rect(0,-X,S,X).subtract(knife(0,-X));const dt=-148,dh=30;
 return {g:U(g,poly([[0,dt+S*T],[S,dt],[S,dt+dh-S*T],[0,dt+dh]])),w:S};};
const SB={n:[9,9],h:[9,9],u:[9,9],r:[9,2],a:[6,9],q:[6,9],c:[6,4],s:[6,6],i:[9,9]};
const KERN={rr:-1,ra:-3,qu:-1};
function word(str){let x=0,parts=[],prev=null,pos=[];for(const ch of str){const {g,w}=G[ch]();if(prev)x+=KERN[prev+ch]||0;x+=SB[ch][0];pos.push([ch,x]);g.translate(new P.Point(x,0));parts.push(g);x+=w+SB[ch][1];prev=ch;}
 return {path:U(...parts),adv:x,pos};}
module.exports={P,G,word,rr,rect,poly,U,knife,S,H,X,ASC,T};
