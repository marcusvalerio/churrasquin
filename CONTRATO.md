# Contrato técnico — churrasquin (site estático, HTML/CSS/JS puro, sem build, sem libs externas, abre por file:// ou servidor simples)

## Arquivos e donos
- brand/  (diretor de arte): logo-1.svg, logo-2.svg, logo-3.svg (+ opcionais), logo.svg (o recomendado, cópia de um deles), tokens.css, index.html (vitrine das logos)
- index.html, app/styles.css, app/main.js, app/cuts-art.js (designer de produto): app principal, catálogo, ilustrações dos cortes
- data/cortes.js, app/calc.js (designer de UX): conteúdo dos cortes e calculadora
- app/animal.js (motion designer): modal do "i" com o animal, zoom na região e explicação

## Ordem de carregamento no index.html
brand/tokens.css, app/styles.css, data/cortes.js, app/cuts-art.js, app/animal.js, app/calc.js, app/main.js

## Tokens CSS (brand/tokens.css define os valores; todos usam só estes nomes)
--c-carvao (fundo escuro), --c-carvao-2 (superfície), --c-brasa (primária/ação), --c-brasa-2 (hover),
--c-osso (fundo claro/texto em escuro), --c-sal (texto suave), --c-ervas (acento verde), --c-gordura (creme),
--c-carne (vermelho de carne crua), --font-display, --font-body, --r-sm, --r-md, --r-lg, --ease-brasa (curva assinatura), --dur-1, --dur-2, --dur-3

## Dados: window.CORTES (array) e window.APETITE
{ id, nome, nomes: { ar?, uy?, us? }, paises: ['BR','AR','UY','US'], animal: 'boi'|'porco'|'cordeiro'|'frango',
  regiao: <id de região abaixo>, categoria: 'nobre'|'tradicional'|'steak'|'popular'|'miudo',
  maciez: 1-5, gordura: 1-5, sabor: 1-5, porque: string, preparo: string, ponto: string,
  tempo: string, pesoPeca: string, rendimento: número 0-1 (fração aproveitada após assar/limpar) }
window.APETITE = { pouco: {label, gramas}, confortavel: {...}, bem: {...} }  (gramas de carne crua por pessoa)

## IDs de corte (todos precisam existir em CORTES e em CUT_ART)
picanha, maminha, fraldinha, contrafile, ancho, file-mignon, alcatra, cupim, costela, costela-janela, acem, peito,
vazio, entrana, tira-de-asado, matambre, ojo-de-bife, bife-de-chorizo, colita-de-cuadril, entrecot,
t-bone, porterhouse, tomahawk, ribeye, ny-strip, flat-iron, denver, tri-tip, short-rib,
pancetta-suina, costelinha-suina, lombo-suino, copa-lombo, panceta, linguica-toscana, carre-cordeiro, pernil-cordeiro,
coracao-frango, coxa-sobrecoxa, asa-frango, chorizo, morcilla

## IDs de região (usados por animal.js para destacar; cada corte aponta para um)
boi: cupim, pescoco, acem, peito, paleta, costela, ponta-de-agulha, contrafile, file-mignon, alcatra, picanha, maminha, fraldinha, patinho, coxao, musculo
porco: lombo, copa, barriga, costela-suina, pernil, paleta-suina
cordeiro: carre, pernil-cordeiro, paleta-cordeiro, costela-cordeiro
frango: coxa, asa, peito-frango, coracao
(linguiças/embutidos: regiao = 'barriga' ou 'paleta-suina'; chorizo = 'paleta-suina'; morcilla = 'barriga')

## APIs globais
- window.CUT_ART[id] -> string SVG (ilustração fiel da peça, viewBox 0 0 320 220)
- window.Animal.open(corteId) / window.Animal.close()  -> modal acessível (foco preso, Esc fecha, prefers-reduced-motion respeitado também no JS)
- window.Calc.mount(elemento) -> renderiza a calculadora; window.Calc.add(corteId) adiciona item (o catálogo chama isso no botão "levar")
- Catálogo: cada card tem botão "i" (aria-label "Saiba de onde vem a <nome>") -> Animal.open(id), e botão "+ levar" -> Calc.add(id)
