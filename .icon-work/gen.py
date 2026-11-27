import json
P=lambda d,**k:dict(tone="line",type="path",d=d,**k)
D=lambda x,y,r=1.0:dict(tone="line",type="circle",cx=x,cy=y,r=r,paint="fill")
icons=[
 dict(name="boi",label="Boi",group="conteudo",tags=["carne bovina","vaca"],shapes=[
  P("M6.5 15V8.5A1.5 1.5 0 0 1 8 7h8a1.5 1.5 0 0 1 1.5 1.5V15"),
  P("M8 7C5.5 7 3.5 5.6 3.5 3.5"),P("M16 7c2.5 0 4.5-1.4 4.5-3.5"),
  P("M6.5 9.8 3.5 10.3c.8 1.4 1.8 1.9 3 1.9"),P("M17.5 9.8l3 .5c-.8 1.4-1.8 1.9-3 1.9"),
  dict(tone="line",type="rect",x=6.5,y=14.5,width=11,height=6.5,rx=3.25),
  D(9.6,11.2,.95),D(14.4,11.2,.95),D(10,17.8,.8),D(14,17.8,.8)]),
 dict(name="porco",label="Porco",group="conteudo",tags=["suino"],shapes=[
  P("M6.6 8.2 5.6 3.6l4.2 2.3"),P("M17.4 8.2l1-4.6-4.2 2.3"),
  dict(tone="line",type="circle",cx=12,cy=13,r=7.6),
  dict(tone="line",type="ellipse",cx=12,cy=15.4,rx=3.4,ry=2.4),
  D(9,10.8,.95),D(15,10.8,.95),D(10.9,15.4,.7),D(13.1,15.4,.7)]),
 dict(name="frango",label="Frango",group="conteudo",tags=["galinha","ave"],note="ave inteira de perfil: so a cabeca nao le (teste cego)",shapes=[
  dict(tone="line",type="circle",cx=8.5,cy=7.2,r=2.6),
  P("M7.3 4.6c.1-1.1 1.4-1.6 2.2-.7.6-.6 1.8-.3 1.8.9"),
  P("M5.9 6.6 3.6 7.5l2.4.8"),
  P("M7.4 9.6C5.9 10.8 5 12.6 5 14.6c0 2.9 2.7 4.6 6.6 4.6 4 0 6.6-2 7.1-5.3.3-1.8.4-3.6 1.4-5.5-2.4.3-4 1.4-5.2 3-1.5.7-3.8.4-5-1.6"),
  P("M10.5 19.2v1.8M13.5 19v2"),D(8.7,6.9,.75)]),
 dict(name="grelha",label="Grelha",group="conteudo",tags=["churrasqueira","grill"],note="churrasqueira de bacia com grelha e pes",shapes=[
  P("M3.5 9h17"),P("M7 9V6M10.3 9V6M13.7 9V6M17 9V6"),
  P("M4.5 9a7.5 6.5 0 0 0 15 0"),P("M8.5 14.8 7 21M15.5 14.8 17 21")]),
 dict(name="termometro",label="Termometro",group="conteudo",tags=["temperatura","ponto"],shapes=[
  P("M9.8 13.2V6a2.2 2.2 0 0 1 4.4 0v7.2a4 4 0 1 1-4.4 0Z"),P("M12 9v7.5"),
  P("M17.5 6h2M17.5 9.5h2")]),
 dict(name="fogo-forte",label="Fogo forte",group="conteudo",tags=["brasa","calor alto"],shapes=[
  P("M12 3c1 3 5 4.8 5 9.6a5 5 0 0 1-10 0c0-2 1-3.4 2-4.5.4 1.3 1 2 1.8 2.3C10.6 8 11 5.3 12 3Z"),
  P("M6.2 11.6c-1.8 1.4-2.7 3-2.7 4.8a4 4 0 0 0 4 4h9a4 4 0 0 0 4-4c0-1.8-.9-3.4-2.7-4.8")]),
 dict(name="farofa",label="Farofa",group="conteudo",tags=["acompanhamento","tigela"],shapes=[
  P("M3.5 11.5h17c0 4.4-3.6 7.5-8.5 7.5s-8.5-3.1-8.5-7.5Z"),P("M9 21h6"),
  P("M6.5 11.5C7.4 9.4 9.5 8 12 8s4.6 1.4 5.5 3.5"),
  D(8.5,5.2,.8),D(12,4,.8),D(15.5,5.4,.8),D(11,11,.7),D(13.6,10.3,.7)]),
 dict(name="lista-sacola",label="Lista / sacola",group="navegacao",tags=["compras","lista"],shapes=[
  P("M5 8h14l-1.3 11.2a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8Z"),P("M9 8V6.5a3 3 0 0 1 6 0V8"),
  P("M9.5 12.5h5M9.5 16h3")]),
]
json.dump({"package":{"name":"churrasquin-icons","version":"0.1.0"},"framework":"svg","style":"../icon-style.json","icons":icons},open(".icon-work/sample/icons.json","w"),indent=1,ensure_ascii=False)
