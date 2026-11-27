# source generator for icons.json (churrasquin duotone-line). Edit here, then: python3 gen.py
import json
def P(d): return dict(tone="line",type="path",d=d)
def Bp(d): return dict(tone="body",type="path",d=d,paint="fill")
def BL(d): return [Bp(d),P(d)]
def D(x,y,r=.95): return dict(tone="line",type="circle",cx=x,cy=y,r=r,paint="fill")
def C(x,y,r,fill=False):
    s=[dict(tone="line",type="circle",cx=x,cy=y,r=r)]
    return ([dict(tone="body",type="circle",cx=x,cy=y,r=r,paint="fill")] if fill else [])+s
def R(x,y,w,h,rx,fill=False):
    s=[dict(tone="line",type="rect",x=x,y=y,width=w,height=h,rx=rx)]
    return ([dict(tone="body",type="rect",x=x,y=y,width=w,height=h,rx=rx,paint="fill")] if fill else [])+s
def coals(): return [P("M5.5 21a2 2 0 0 1 4 0M10 21a2 2 0 0 1 4 0M14.5 21a2 2 0 0 1 4 0"),P("M4 21h16")]
steak="M4 13c0-4.4 3.6-8 8.5-8C17 5 20 7.6 20 11c0 4-3.4 8-9 8-4.2 0-7-2.6-7-6Z"
lowsteak="M4 15.5c0-3.4 3.2-5.5 8-5.5s8 2.1 8 5c0 3-3.3 5.2-8.5 5.2C6.8 20.2 4 18.6 4 15.5Z"
bag="M5 8h14l-1.3 11.2a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8Z"
chick="M7.4 9.6C5.9 10.8 5 12.6 5 14.6c0 2.9 2.7 4.6 6.6 4.6 4 0 6.6-2 7.1-5.3.3-1.8.4-3.6 1.4-5.5-2.4.3-4 1.4-5.2 3-1.5.7-3.8.4-5-1.6"
G={}
G["navegacao"]=[
 ("inicio","Início",["casa","home"],BL("M5.5 10.2 12 4.6l6.5 5.6V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19Z")+[P("M3.5 11.5 12 4.2l8.5 7.3"),P("M10 20.5v-4.5a2 2 0 0 1 4 0v4.5")]),
 ("planejar","Planejar",["plano","checklist"],R(5,4.5,14,16.5,2.5,True)+R(9,3.9,6,2.6,1)+[P("M8.5 11l1.2 1.2 2.3-2.4M14 11h2M8.5 16l1.2 1.2 2.3-2.4M14 16h2")]),
 ("cortes","Cortes",["carne","bife"],BL(steak)+[P("M7.5 13c0-2.8 2.2-4.6 5-4.6")]+C(14.5,12,1.8)),
 ("na-brasa","Na brasa",["fogo","grelha"],BL("M12 3c.3 2.4 2.2 3.6 3.2 5.6.6-.6.9-1.3 1-2.2 1.6 2 2 4.5 1.3 6.6H6.5c-.9-2.6 0-5.3 2-7 0 1.2.4 2 1 2.6C9.6 6 10.6 4.4 12 3Z")+[P("M3.8 16.5h16.4M7.5 16.5V20M12 16.5V20M16.5 16.5V20")]),
 ("receitas","Receitas",["livro"],BL("M12 6.5C10.3 5.2 7.8 4.8 4 5v13c3.8-.2 6.3.2 8 1.5 1.7-1.3 4.2-1.7 8-1.5V5c-3.8-.2-6.3.2-8 1.5Z")+[P("M12 6.5v13")]),
 ("lista-sacola","Lista / sacola",["compras"],BL(bag)+[P("M9 8V6.5a3 3 0 0 1 6 0V8"),P("M9.5 12.5h5M9.5 16h3")]),
]
G["acoes"]=[
 ("adicionar","Adicionar",["mais"],[P("M12 5v14M5 12h14")]),
 ("remover","Remover",["lixo","apagar"],BL("M6.5 8h11l-.8 11.2a2 2 0 0 1-2 1.8H9.3a2 2 0 0 1-2-1.8Z")+[P("M4.5 8h15"),P("M9.5 8V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V8"),P("M10.5 11.5V17M13.5 11.5V17")]),
 ("compartilhar","Compartilhar",["enviar"],[dict(tone="body",type="rect",x=5,y=12,width=14,height=8.5,rx=1.5,paint="fill"),P("M8 12H6.5A1.5 1.5 0 0 0 5 13.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-5.5a1.5 1.5 0 0 0-1.5-1.5H16"),P("M12 15V3.8M8 7.5l4-3.7 4 3.7")]),
 ("copiar","Copiar",["duplicar"],[P("M15.5 8V5.5A1.5 1.5 0 0 0 14 4H5.5A1.5 1.5 0 0 0 4 5.5V14a1.5 1.5 0 0 0 1.5 1.5H8")]+R(8,8,12,12,2,True)),
 ("fechar","Fechar",["x"],[P("M6.5 6.5l11 11M17.5 6.5l-11 11")]),
 ("avancar","Avançar",["seta","proximo"],[P("M5 12h14M13 6l6 6-6 6")]),
 ("voltar","Voltar",["seta"],[P("M19 12H5M11 6l-6 6 6 6")]),
 ("info","Informação",["ajuda"],C(12,12,8.5,True)+[P("M12 11v5.5"),D(12,8)]),
 ("busca","Busca",["procurar","lupa"],C(10.5,10.5,6,True)+[P("M15 15l5 5")]),
 ("filtro","Filtro",["funil"],BL("M4 5h16l-6 7.5V19l-4 1.5v-8Z")),
 ("play","Iniciar",["play"],BL("M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5Z")),
 ("pause","Pausar",["pausa"],R(6.5,5,4,14,1.5,True)+R(13.5,5,4,14,1.5,True)),
 ("check","Confirmar",["ok","feito"],[P("M5 12.5l4.5 4.5L19 7.5")]),
 ("editar","Editar",["lapis"],BL("M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 0l.5.5a2.1 2.1 0 0 1 0 3L8.5 19Z")+[P("M13.5 7l3.5 3.5")]),
 ("desfazer","Desfazer",["voltar acao"],[P("M9 5 4.5 9.5 9 14"),P("M4.5 9.5H14a5.5 5.5 0 0 1 0 11h-3")]),
]
G["conteudo"]=[
 ("boi","Boi",["bovino"],[dict(tone="body",type="rect",x=6.5,y=14.5,width=11,height=6.5,rx=3.25,paint="fill"),P("M6.5 15V8.5A1.5 1.5 0 0 1 8 7h8a1.5 1.5 0 0 1 1.5 1.5V15"),P("M8 7C5.5 7 3.5 5.6 3.5 3.5"),P("M16 7c2.5 0 4.5-1.4 4.5-3.5"),P("M6.5 9.8 3.5 10.3c.8 1.4 1.8 1.9 3 1.9"),P("M17.5 9.8l3 .5c-.8 1.4-1.8 1.9-3 1.9")]+R(6.5,14.5,11,6.5,3.25)+[D(9.6,11.2),D(14.4,11.2),D(10,17.8,.8),D(14,17.8,.8)]),
 ("porco","Porco",["suino"],[dict(tone="body",type="ellipse",cx=12,cy=15.4,rx=3.4,ry=2.4,paint="fill"),P("M6.6 8.2 5.6 3.6l4.2 2.3"),P("M17.4 8.2l1-4.6-4.2 2.3")]+C(12,13,7.6)+[dict(tone="line",type="ellipse",cx=12,cy=15.4,rx=3.4,ry=2.4),D(9,10.8),D(15,10.8),D(10.9,15.4,.7),D(13.1,15.4,.7)]),
 ("cordeiro","Cordeiro",["ovelha","carneiro"],BL("M6.5 16.5a2.5 2.5 0 0 1-1.7-4.3 2.6 2.6 0 0 1 2.4-4.1 3 3 0 0 1 5.3-.7 2.7 2.7 0 0 1 3.7 2.4V14a2.5 2.5 0 0 1-2.5 2.5Z")+[P("M7.5 16.5V20M12.5 16.5V20")]+[dict(tone="body",type="ellipse",cx=17.6,cy=11,rx=2.4,ry=3.1,paint="fill"),dict(tone="line",type="ellipse",cx=17.6,cy=11,rx=2.4,ry=3.1),P("M16.2 8.6 14.6 7.6"),D(18.2,10.4,.75)]),
 ("frango","Frango (coxa)",["coxa","galinha","ave"],BL("M14.5 12.8c-1.9 1.9-5 2.2-7.4.6C4.6 11.8 4.2 8.2 6.2 6 8.4 3.8 12 4 13.9 6.3c1.7 2 1.8 4.6.6 6.5Z")+[P("M14.2 12.6l3.2 3.2")]+C(18.6,16,1.4,True)+C(16.6,18,1.4,True)+[P("M7.5 7.5c.8-.8 1.8-1.1 2.8-1")]),
 ("linguica","Linguiça",["embutido"],BL("M5 8.5c0 6 4.5 10.5 10.5 10.5a2.25 2.25 0 0 0 0-4.5C12 14.5 9.5 12 9.5 8.5a2.25 2.25 0 0 0-4.5 0Z")+[P("M7.25 6.2 6.9 4M17.8 16.75l2.2.4")]),
 ("carvao","Carvão",["brasa","combustivel"],BL("M4 20.5 5 15l4-2 3.5 3-1 4.5Z")+BL("M12.5 20.5l1-6 4-2.5 3 3.5-.5 5Z")+BL("M8 11l1.5-4.5 4-1.5 3 3-1.5 4Z")),
 ("fogo-forte","Fogo forte",["chama alta"],BL("M7.2 17.5C6 15 6.4 12.5 8 10.5c.2 1.8 1 2.7 2 3.1C9.6 9.5 11 6 13 3c.2 3.5 2.5 5 3 8 .6-.6 1-1.4 1.2-2.5 1.6 2.7 1.2 6.5-.4 9Z")+coals()),
 ("fogo-medio","Fogo médio",["chama media"],BL("M8.2 17.5C6.9 15.4 7.2 12.7 9 11c.2 1.4.8 2.2 1.6 2.6.2-2.9 1.4-5.2 3.4-6.6.1 2.6 1.5 4.2 2.2 6.1.7 1.9.4 3.3-.4 4.4Z")+coals()),
 ("fogo-brando","Fogo brando",["chama baixa"],BL("M9.2 17.5c-.9-1.7-.5-3.5 1-4.8.3 1 .8 1.5 1.3 1.7.2-1.6 1-2.8 2.3-3.4.2 1.9 1.4 2.9 1.6 4.4.1 .8-.1 1.5-.5 2.1Z")+coals()),
 ("fogo-indireto","Fogo indireto",["calor indireto"],[P("M3.8 13h16.4")]+R(13,9,6.5,4,1.8,True)+[P("M4.5 20.5a2 2 0 0 1 4 0M8.5 20.5a2 2 0 0 1 4 0M4 20.5h9"),P("M6.5 10C7 6.5 9 4.8 12.5 4.8"),P("M11 3.4l1.5 1.4L11 6.2")]),
 ("termometro","Termômetro",["temperatura","ponto"],C(12,16.54,3.2,True)[:1]+[P("M9.8 13.2V6a2.2 2.2 0 0 1 4.4 0v7.2a4 4 0 1 1-4.4 0Z"),P("M12 9v7.5"),P("M17.5 6h2M17.5 9.5h2")]),
 ("faca","Faca",["cortar"],BL("M14 10 3.8 20.2C9 19.5 14 16.5 16.5 12.5Z")+[P("M14 10l3.6-3.6a1.8 1.8 0 0 1 2.5 2.5l-3.6 3.6")]),
 ("espeto","Espeto",["churrasco"],[P("M6.8 12h13.2M18.5 10.8l1.5 1.2-1.5 1.2")]+C(5.3,12,1.5)+R(7.5,8,4,8,1.8,True)+R(13,8,4,8,1.8,True)),
 ("grelha","Grelha",["churrasqueira"],[Bp("M4.5 9a7.5 6.5 0 0 0 15 0Z"),P("M3.5 9h17"),P("M7 9V6M10.3 9V6M13.7 9V6M17 9V6"),P("M4.5 9a7.5 6.5 0 0 0 15 0"),P("M8.5 14.8 7 21M15.5 14.8 17 21")]),
 ("turma","Turma",["pessoas","grupo"],[Bp("M6.5 19.5a5.5 5.5 0 0 1 11 0Z")]+C(12,8,2.8,True)+[P("M6.5 19.5a5.5 5.5 0 0 1 11 0")]+C(6,10.5,2)+C(18,10.5,2)+[P("M3.5 18.5a3.5 3.5 0 0 1 3-3.4M20.5 18.5a3.5 3.5 0 0 0-3-3.4")]),
 ("adulto","Adulto",["pessoa"],C(12,7,3,True)+BL("M6 20.5v-2a6 6 0 0 1 12 0v2Z")),
 ("crianca","Criança",["pessoa pequena"],C(12,11,2.4,True)+BL("M8.5 20.5v-1.3a3.5 3.5 0 0 1 7 0v1.3Z")+[P("M11 8.4c.2-1.3 1.2-2 2.2-1.6")]),
 ("relogio","Relógio",["hora"],C(12,12,8.5,True)+[P("M12 7.5V12l3 2")]),
 ("timer","Timer",["cronometro"],C(12,13.5,7,True)+[P("M10 3.8h4M12 3.8v2.7M17.6 7.4l1.2-1.2"),P("M12 10v3.5l2 1")]),
 ("alerta","Alerta",["aviso"],BL("M10.3 5a2 2 0 0 1 3.4 0l6.6 11.5a2 2 0 0 1-1.7 3H5.4a2 2 0 0 1-1.7-3Z")+[P("M12 9.5v4.5"),D(12,16.8)]),
 ("maciez","Maciez",["macio","faca na carne"],BL(lowsteak)+BL("M15 7.5 8.5 14c3-.3 6.4-2.2 8-4.5Z")+[P("M15 7.5l2.6-2.6a1.3 1.3 0 0 1 1.8 1.8l-2.6 2.6")]),
 ("gordura","Gordura",["gota","marmoreio"],BL("M12 3.5c3 3.7 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 3-6.8 6-10.5Z")+[P("M9.3 14.5a2.8 2.8 0 0 0 2.2 2.8")]),
 ("sabor","Sabor",["aroma","gosto"],BL(lowsteak)+[P("M8.5 7.8c-1-1 1-2.2 0-3.8M12 7.8c-1-1 1-2.2 0-3.8M15.5 7.8c-1-1 1-2.2 0-3.8")]),
 ("farofa","Farofa",["acompanhamento"],[Bp("M6.5 11.5C7.4 9.4 9.5 8 12 8s4.6 1.4 5.5 3.5Z"),P("M3.5 11.5h17c0 4.4-3.6 7.5-8.5 7.5s-8.5-3.1-8.5-7.5Z"),P("M9 21h6"),P("M6.5 11.5C7.4 9.4 9.5 8 12 8s4.6 1.4 5.5 3.5"),D(8.5,5.2,.8),D(12,4,.8),D(15.5,5.4,.8)]),
 ("molho","Molho",["garrafa","vinagrete"],BL("M9.5 8h5l1.5 3v8a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 19v-8Z")+[P("M10.5 8V4.5h3V8"),P("M8 13.5h8")]),
 ("maionese","Maionese",["pote"],R(7.5,4,9,3,1)+R(6,8.5,12,12,2.5,True)+[P("M9.2 15.5c0-2 1.3-3.3 2.8-3.3s2.8 1.3 2.8 3.3M9.2 15.5h5.6")]),
 ("acompanhamento","Acompanhamento",["prato","travessa"],BL("M5 16a7 7 0 0 1 14 0Z")+[P("M3.5 18.5h17")]+C(12,7,1.3)),
 ("tempero","Tempero",["sal","saleiro"],BL("M7 11h8l.9 8.4a1.5 1.5 0 0 1-1.5 1.6H7.6a1.5 1.5 0 0 1-1.5-1.6Z")+[P("M8 11V8a3 3 0 0 1 6 0v3")]+[D(17.5,4.5,.75),D(19.5,7,.75),D(17.2,7.8,.75)]),
 ("bebida","Bebida",["cerveja","caneca"],BL("M5 8h10v11a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 5 19Z")+[P("M15 10.5h2.5a2 2 0 0 1 2 2v2.5a2 2 0 0 1-2 2H15"),P("M5 8c0-2 1.4-3.2 3-3.2.8-.9 2.4-1.1 3.4-.3 1.6-.5 3.6.5 3.6 3.5"),P("M8.5 11.5v5.5M11.5 11.5v5.5")]),
]
G["bandeiras"]=[
 ("bandeira-br","Brasil",["pais"],R(4,6,16,12,2.5)+BL("M12 8 18 12l-6 4-6-4Z")+C(12,12,2)),
 ("bandeira-ar","Argentina",["pais"],[Bp("M4 10V8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10Z"),Bp("M4 14v1.5A2.5 2.5 0 0 0 6.5 18h11a2.5 2.5 0 0 0 2.5-2.5V14Z")]+R(4,6,16,12,2.5)+[P("M4 10h16M4 14h16"),D(12,12,1.1)]),
 ("bandeira-uy","Uruguai",["pais"],R(4,6,16,12,2.5)+[P("M11.5 6v6.5H4M11.5 9.2H20M4 15.5h16")]+C(7.7,9.2,1.4,True)),
 ("bandeira-us","Estados Unidos",["pais","eua"],[Bp("M4 12.5V8.5A2.5 2.5 0 0 1 6.5 6h5v6.5Z")]+R(4,6,16,12,2.5)+[P("M11.5 6v6.5H4M11.5 9.2H20M4 15.5h16"),D(6.6,8.4,.6),D(9,8.4,.6),D(7.8,10.4,.6)]),
]
icons=[dict(name=n,label=l,group=g,tags=t,shapes=s) for g,L in G.items() for n,l,t,s in L]
icons[[i["name"] for i in icons].index("frango")]["note"]="coxa de frango (metafora universal; galinha de perfil foi lida como pato)"
for i in icons:
    if i["group"]=="bandeiras": i["note"]="bandeira simplificada em linha: campo + emblema-chave; uso decorativo ao lado do nome do pais"
json.dump({"package":{"name":"churrasquin-icons","version":"0.1.0"},"framework":"svg","style":"./icon-style.json","icons":icons},open("icons.json","w"),indent=1,ensure_ascii=False)
