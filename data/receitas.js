/* churrasquin — data/receitas.js
 * Receitas clássicas de acompanhamento do churrasco (BR/AR/UY). Quantidades para o campo "rende" (porções).
 * combinaCom usa ids de data/cortes.js. window.escalarReceita(receita, porcoes) reescala ingredientes.
 */
(function () {
  function i(q, un, item) { return { q: q, un: un, item: item }; }
  var G = 'g', ML = 'ml', CS = 'colher (sopa)', X = 'xícara', U = 'unid.', AG = 'a gosto';

  window.RECEITAS = [
    // ---------- FAROFAS ----------
    { id: 'farofa-ovo', nome: 'Farofa de ovo', categoria: 'farofa', resumo: 'Farofa úmida e dourada com ovos mexidos na manteiga.',
      rende: 6, tempo: 15, dificuldade: 1, combinaCom: ['picanha', 'fraldinha', 'costela', 'linguica-toscana'],
      ingredientes: [i(300, G, 'farinha de mandioca torrada'), i(4, U, 'ovos'), i(60, G, 'manteiga'), i(1, U, 'cebola média picada'), i(2, CS, 'cheiro-verde picado'), i(null, AG, 'sal')],
      passos: ['Derreta a manteiga e doure a cebola.', 'Junte os ovos e mexa até quase firmarem.', 'Adicione a farinha aos poucos, mexendo por 3-4 min.', 'Acerte o sal e finalize com cheiro-verde.'],
      dica: 'Tire os ovos do fogo ainda cremosos: eles terminam de cozinhar na farinha.', tags: ['clássico', 'rápido', 'vegetariano'] },

    { id: 'farofa-bacon', nome: 'Farofa de bacon', categoria: 'farofa', resumo: 'Farofa crocante na gordura do bacon, com cebola e alho.',
      rende: 6, tempo: 20, dificuldade: 1, combinaCom: ['picanha', 'maminha', 'cupim', 'costela', 'alcatra'],
      ingredientes: [i(200, G, 'bacon em cubos'), i(300, G, 'farinha de mandioca torrada'), i(1, U, 'cebola média picada'), i(3, U, 'dentes de alho picados'), i(30, G, 'manteiga'), i(2, CS, 'salsinha picada'), i(null, AG, 'sal')],
      passos: ['Frite o bacon em fogo médio até dourar e soltar a gordura.', 'Junte manteiga, cebola e alho; refogue até murchar.', 'Acrescente a farinha e toste mexendo por 5 min.', 'Prove antes de salgar e finalize com salsinha.'],
      dica: 'O bacon já é salgado: sal só no final, se precisar.', tags: ['clássico', 'crocante'] },

    { id: 'farofa-banana', nome: 'Farofa de banana', categoria: 'farofa', resumo: 'Farofa adocicada com banana-da-terra dourada na manteiga.',
      rende: 6, tempo: 20, dificuldade: 1, combinaCom: ['lombo-suino', 'pancetta-suina', 'costelinha-suina', 'copa-lombo', 'coxa-sobrecoxa'],
      ingredientes: [i(3, U, 'bananas-da-terra maduras em rodelas'), i(250, G, 'farinha de mandioca torrada'), i(60, G, 'manteiga'), i(1, U, 'cebola pequena picada'), i(null, AG, 'sal'), i(null, AG, 'canela em pó (opcional)')],
      passos: ['Doure as bananas na metade da manteiga e reserve.', 'Na mesma panela, refogue a cebola no resto da manteiga.', 'Junte a farinha e toste por 3 min.', 'Volte as bananas, misture delicadamente e acerte o sal.'],
      dica: 'Banana-nanica serve, mas desmancha: doure rápido e junte no final.', tags: ['doce-salgado', 'porco'] },

    { id: 'farofa-cebola-caramelizada', nome: 'Farofa de cebola caramelizada', categoria: 'farofa', resumo: 'Cebola em fogo baixo até virar doce, envolvida em farinha amanteigada.',
      rende: 6, tempo: 35, dificuldade: 2, combinaCom: ['picanha', 'ancho', 'contrafile', 'bife-de-chorizo', 'entrecot'],
      ingredientes: [i(3, U, 'cebolas grandes em meia-lua fina'), i(80, G, 'manteiga'), i(1, CS, 'açúcar mascavo'), i(250, G, 'farinha de mandioca torrada'), i(null, AG, 'sal'), i(null, AG, 'pimenta-do-reino')],
      passos: ['Cozinhe a cebola na manteiga em fogo baixo por 20-25 min, mexendo às vezes.', 'Junte o açúcar e deixe caramelizar mais 3 min.', 'Pingue um pouco de água para soltar o fundo.', 'Adicione a farinha, toste 3 min e tempere.'],
      dica: 'Fogo alto queima antes de caramelizar: paciência é o ingrediente.', tags: ['vegetariano', 'especial'] },

    { id: 'farofa-linguica', nome: 'Farofa de linguiça', categoria: 'farofa', resumo: 'Farofa robusta com linguiça calabresa ou toscana esfarelada.',
      rende: 6, tempo: 20, dificuldade: 1, combinaCom: ['costela', 'cupim', 'fraldinha', 'acem', 'peito'],
      ingredientes: [i(300, G, 'linguiça calabresa em cubos pequenos'), i(300, G, 'farinha de mandioca torrada'), i(1, U, 'cebola média picada'), i(2, U, 'dentes de alho picados'), i(30, G, 'manteiga'), i(2, CS, 'cebolinha picada'), i(null, AG, 'sal')],
      passos: ['Frite a linguiça até dourar bem.', 'Junte manteiga, cebola e alho e refogue.', 'Adicione a farinha e toste por 4-5 min.', 'Finalize com cebolinha e acerte o sal.'],
      dica: 'Sobrou linguiça do churrasco? Pique e use aqui.', tags: ['aproveitamento', 'clássico'] },

    // ---------- MOLHOS ----------
    { id: 'vinagrete', nome: 'Vinagrete', categoria: 'molho', resumo: 'Tomate, cebola e pimentão picadinhos no vinagre e azeite.',
      rende: 8, tempo: 15, dificuldade: 1, combinaCom: ['picanha', 'fraldinha', 'alcatra', 'linguica-toscana', 'coracao-frango', 'maminha'],
      ingredientes: [i(4, U, 'tomates sem sementes em cubinhos'), i(1, U, 'cebola grande em cubinhos'), i(1, U, 'pimentão verde em cubinhos'), i(4, CS, 'cheiro-verde picado'), i(100, ML, 'vinagre de vinho branco'), i(60, ML, 'azeite'), i(1, CS, 'água gelada'), i(null, AG, 'sal')],
      passos: ['Pique tudo em cubos pequenos e iguais.', 'Misture vinagre, azeite, água e sal.', 'Junte os legumes e o cheiro-verde.', 'Descanse 15 min na geladeira antes de servir.'],
      dica: 'Tire as sementes do tomate para o vinagrete não aguar.', tags: ['clássico', 'vegano', 'fresco'] },

    { id: 'chimichurri', nome: 'Chimichurri', categoria: 'molho', resumo: 'Molho argentino de salsinha, orégano, alho e pimenta no azeite.',
      rende: 8, tempo: 15, dificuldade: 1, combinaCom: ['vazio', 'entrana', 'tira-de-asado', 'bife-de-chorizo', 'ojo-de-bife', 'matambre', 'chorizo'],
      ingredientes: [i(1, X, 'salsinha bem picada'), i(2, CS, 'orégano seco'), i(4, U, 'dentes de alho picados'), i(1, CS, 'pimenta calabresa (ají molido)'), i(120, ML, 'azeite'), i(60, ML, 'vinagre de vinho tinto'), i(60, ML, 'água quente com 1 col. (chá) de sal dissolvida')],
      passos: ['Hidrate o orégano e a pimenta na salmoura quente por 5 min.', 'Junte salsinha e alho.', 'Adicione vinagre e azeite e misture.', 'Descanse ao menos 1 h antes de usar.'],
      dica: 'Fica melhor no dia seguinte; dura 1 semana na geladeira coberto de azeite.', tags: ['argentino', 'uruguaio', 'vegano'] },

    { id: 'molho-alho', nome: 'Molho de alho', categoria: 'molho', resumo: 'Creme branco de alho e leite, para pão e carnes.',
      rende: 8, tempo: 10, dificuldade: 1, combinaCom: ['picanha', 'coracao-frango', 'asa-frango', 'linguica-toscana', 'fraldinha'],
      ingredientes: [i(6, U, 'dentes de alho'), i(100, ML, 'leite gelado'), i(200, ML, 'óleo de girassol'), i(1, CS, 'suco de limão'), i(null, AG, 'sal')],
      passos: ['Bata alho, leite e sal no liquidificador.', 'Com o motor ligado, acrescente o óleo em fio até engrossar.', 'Junte o limão e bata mais 5 s.', 'Guarde na geladeira por até 3 dias.'],
      dica: 'Leite e óleo gelados garantem que a emulsão não desande.', tags: ['sem ovo', 'cremoso'] },

    { id: 'molho-campanha', nome: 'Molho campanha', categoria: 'molho', resumo: 'Vinagrete gaúcho mais grosso, com cebola roxa e pimentão colorido.',
      rende: 8, tempo: 15, dificuldade: 1, combinaCom: ['costela', 'costela-janela', 'picanha', 'cupim', 'salsichao'],
      ingredientes: [i(3, U, 'tomates firmes em cubos médios'), i(1, U, 'cebola roxa em cubos médios'), i(0.5, U, 'pimentão vermelho em cubos'), i(0.5, U, 'pimentão amarelo em cubos'), i(3, CS, 'salsinha picada'), i(80, ML, 'vinagre de vinho tinto'), i(80, ML, 'azeite'), i(null, AG, 'sal'), i(null, AG, 'pimenta-do-reino')],
      passos: ['Corte os legumes em cubos de ~1 cm.', 'Tempere com vinagre, azeite, sal e pimenta.', 'Junte a salsinha.', 'Gele por 20 min.'],
      dica: 'Cubos maiores que o vinagrete comum: é para comer de garfo.', tags: ['gaúcho', 'vegano', 'fresco'] },

    { id: 'salsa-criolla', nome: 'Salsa criolla', categoria: 'molho', resumo: 'Molho rioplatense de cebola, tomate e pimentão no vinagre.',
      rende: 8, tempo: 15, dificuldade: 1, combinaCom: ['tira-de-asado', 'vazio', 'chorizo', 'morcilla', 'matambre', 'entrana'],
      ingredientes: [i(1, U, 'cebola grande em tiras finas ou cubinhos'), i(2, U, 'tomates sem sementes em cubinhos'), i(1, U, 'pimentão vermelho em cubinhos'), i(1, CS, 'orégano seco'), i(80, ML, 'vinagre de vinho'), i(80, ML, 'óleo ou azeite'), i(null, AG, 'sal'), i(null, AG, 'pimenta calabresa')],
      passos: ['Deixe a cebola de molho em água fria 10 min e escorra.', 'Misture com tomate e pimentão.', 'Tempere com orégano, vinagre, óleo, sal e pimenta.', 'Descanse 30 min.'],
      dica: 'Servir com choripán é obrigatório.', tags: ['argentino', 'uruguaio', 'vegano'] },

    { id: 'molho-mostarda-mel', nome: 'Molho de mostarda e mel', categoria: 'molho', resumo: 'Molho agridoce cremoso para porco e frango.',
      rende: 6, tempo: 5, dificuldade: 1, combinaCom: ['lombo-suino', 'costelinha-suina', 'asa-frango', 'coxa-sobrecoxa', 'copa-lombo'],
      ingredientes: [i(4, CS, 'mostarda amarela'), i(1, CS, 'mostarda dijon'), i(3, CS, 'mel'), i(3, CS, 'maionese'), i(1, CS, 'suco de limão'), i(null, AG, 'sal')],
      passos: ['Misture as mostardas e o mel.', 'Junte maionese e limão até ficar liso.', 'Acerte o sal.'],
      dica: 'Sem maionese vira glaze: pincele no último minuto de grelha.', tags: ['agridoce', 'rápido'] },

    { id: 'barbecue-caseiro', nome: 'Molho barbecue caseiro', categoria: 'molho', resumo: 'Barbecue defumado de ketchup, açúcar mascavo e vinagre.',
      rende: 8, tempo: 25, dificuldade: 2, combinaCom: ['costelinha-suina', 'short-rib', 'peito', 'asa-frango', 'costela', 'tri-tip'],
      ingredientes: [i(300, G, 'ketchup'), i(80, G, 'açúcar mascavo'), i(60, ML, 'vinagre de maçã'), i(2, CS, 'molho inglês'), i(1, CS, 'mostarda'), i(1, CS, 'páprica defumada'), i(1, U, 'cebola pequena ralada'), i(2, U, 'dentes de alho ralados'), i(20, G, 'manteiga'), i(null, AG, 'sal e pimenta')],
      passos: ['Refogue cebola e alho na manteiga.', 'Junte os demais ingredientes.', 'Cozinhe em fogo baixo 15 min, mexendo, até engrossar.', 'Esfrie; dura 2 semanas na geladeira.'],
      dica: 'Pincele só no final: o açúcar queima rápido na brasa.', tags: ['americano', 'defumado'] },

    // ---------- MAIONESES ----------
    { id: 'maionese-batata', nome: 'Maionese caseira de batata', categoria: 'maionese', resumo: 'Batata cozida firme com maionese caseira de ovo.',
      rende: 8, tempo: 40, dificuldade: 2, combinaCom: ['picanha', 'costela', 'fraldinha', 'coxa-sobrecoxa', 'linguica-toscana'],
      ingredientes: [i(1000, G, 'batata em cubos'), i(2, U, 'gemas pasteurizadas (ou ovos inteiros)'), i(1, CS, 'mostarda'), i(1, CS, 'suco de limão'), i(250, ML, 'óleo'), i(2, CS, 'cebola ralada'), i(2, CS, 'salsinha picada'), i(null, AG, 'sal')],
      passos: ['Cozinhe a batata em água com sal até ficar macia mas firme (~10 min); esfrie.', 'Bata gemas, mostarda, limão e sal; junte o óleo em fio até emulsionar.', 'Misture a maionese, cebola e salsinha à batata fria.', 'Gele por 1 h antes de servir.'],
      dica: 'Mantenha na geladeira e no máximo 2 h fora dela no calor.', tags: ['clássico', 'manter refrigerado'] },

    { id: 'maionese-verde', nome: 'Maionese verde', categoria: 'maionese', resumo: 'Maionese sem ovo de leite, ervas e alho, verde e aromática.',
      rende: 8, tempo: 10, dificuldade: 1, combinaCom: ['picanha', 'coracao-frango', 'asa-frango', 'fraldinha', 'linguica-toscana'],
      ingredientes: [i(150, ML, 'leite gelado'), i(1, X, 'salsinha e cebolinha'), i(2, U, 'dentes de alho'), i(250, ML, 'óleo gelado'), i(1, CS, 'suco de limão'), i(null, AG, 'sal')],
      passos: ['Bata leite, ervas, alho e sal.', 'Com o liquidificador ligado, junte o óleo em fio até encorpar.', 'Adicione o limão e bata 5 s.', 'Use em até 3 dias.'],
      dica: 'Se ficar rala, junte mais óleo em fio; se ficar firme demais, um fio de leite.', tags: ['sem ovo', 'espetinho'] },

    { id: 'maionese-alho', nome: 'Maionese de alho', categoria: 'maionese', resumo: 'Maionese caseira de ovo bem alhada, estilo aioli.',
      rende: 8, tempo: 10, dificuldade: 2, combinaCom: ['picanha', 'chorizo', 'linguica-toscana', 'lombo-suino', 'carre-cordeiro'],
      ingredientes: [i(1, U, 'ovo inteiro pasteurizado'), i(4, U, 'dentes de alho'), i(1, CS, 'suco de limão'), i(1, CS, 'mostarda dijon'), i(200, ML, 'óleo'), i(null, AG, 'sal')],
      passos: ['Bata ovo, alho, limão, mostarda e sal.', 'Junte o óleo em fio fino até ficar firme.', 'Prove e ajuste limão e sal.', 'Refrigere até servir.'],
      dica: 'Desandou? Comece com outra gema e vá juntando a mistura talhada em fio.', tags: ['aioli', 'manter refrigerado'] },

    { id: 'salada-maionese-legumes', nome: 'Salada de maionese com legumes', categoria: 'maionese', resumo: 'Batata, cenoura, ervilha e ovo na maionese: a de domingo.',
      rende: 10, tempo: 45, dificuldade: 2, combinaCom: ['picanha', 'costela', 'maminha', 'coxa-sobrecoxa', 'lombo-suino'],
      ingredientes: [i(800, G, 'batata em cubos'), i(300, G, 'cenoura em cubos'), i(200, G, 'ervilha (congelada ou lata)'), i(3, U, 'ovos cozidos picados'), i(300, G, 'maionese'), i(2, CS, 'azeite'), i(2, CS, 'cheiro-verde'), i(null, AG, 'sal')],
      passos: ['Cozinhe a cenoura 5 min, junte a batata e cozinhe mais 10 min, firmes.', 'Escorra e tempere ainda morno com azeite e sal.', 'Esfrie e misture ervilha, ovos e maionese.', 'Finalize com cheiro-verde e gele 1 h.'],
      dica: 'Temperar a batata morna faz o sal penetrar; a maionese entra só fria.', tags: ['clássico', 'manter refrigerado'] },

    // ---------- ACOMPANHAMENTOS ----------
    { id: 'pao-alho', nome: 'Pão de alho caseiro', categoria: 'acompanhamento', resumo: 'Pão francês recheado com pasta de alho, manteiga e queijo, na grelha.',
      rende: 8, tempo: 20, dificuldade: 1, combinaCom: ['picanha', 'fraldinha', 'linguica-toscana', 'coracao-frango', 'alcatra'],
      ingredientes: [i(8, U, 'pães franceses'), i(100, G, 'manteiga em temperatura ambiente'), i(3, CS, 'maionese'), i(6, U, 'dentes de alho amassados'), i(50, G, 'parmesão ralado'), i(2, CS, 'salsinha picada'), i(null, AG, 'sal')],
      passos: ['Misture manteiga, maionese, alho, parmesão, salsinha e sal.', 'Faça cortes no pão sem separar e recheie.', 'Asse na grelha alta 8-10 min, virando, até dourar.', 'Sirva quente.'],
      dica: 'Embrulhe em papel-alumínio nos primeiros 5 min para não queimar por fora.', tags: ['clássico', 'brasa'] },

    { id: 'arroz-carreteiro', nome: 'Arroz carreteiro', categoria: 'acompanhamento', resumo: 'Arroz gaúcho com sobras de churrasco picadas e linguiça.',
      rende: 6, tempo: 40, dificuldade: 2, combinaCom: ['costela', 'picanha', 'salsichao', 'cupim', 'acem'],
      ingredientes: [i(500, G, 'sobra de carne de churrasco picada'), i(150, G, 'linguiça em cubos'), i(400, G, 'arroz branco cru'), i(1, U, 'cebola picada'), i(3, U, 'dentes de alho'), i(2, U, 'tomates picados'), i(2, CS, 'óleo'), i(1000, ML, 'água quente'), i(3, CS, 'cheiro-verde'), i(null, AG, 'sal')],
      passos: ['Doure a linguiça no óleo, junte a carne e refogue.', 'Adicione cebola, alho e tomate até amolecer.', 'Junte o arroz, refogue 2 min e cubra com a água quente.', 'Cozinhe tampado em fogo baixo ~18 min; finalize com cheiro-verde.'],
      dica: 'Prove o sal só no fim: a carne já vem temperada.', tags: ['gaúcho', 'aproveitamento'] },

    { id: 'mandioca-cozida-frita', nome: 'Mandioca cozida e frita', categoria: 'acompanhamento', resumo: 'Mandioca cozida macia e depois frita até crocante.',
      rende: 6, tempo: 50, dificuldade: 2, combinaCom: ['costela', 'cupim', 'picanha', 'pancetta-suina', 'linguica-toscana'],
      ingredientes: [i(1000, G, 'mandioca descascada em toletes'), i(1, CS, 'sal (para o cozimento)'), i(1000, ML, 'óleo para fritar'), i(null, AG, 'sal')],
      passos: ['Cozinhe a mandioca em água com sal até abrir e ficar macia (25-30 min).', 'Escorra, retire a fibra central e esfrie bem.', 'Frite em óleo a 180 °C até dourar.', 'Escorra em papel e salgue.'],
      dica: 'Mandioca fria e seca antes de fritar é o segredo da casquinha.', tags: ['crocante', 'vegano'] },

    { id: 'queijo-coalho-melaco', nome: 'Queijo coalho com melaço', categoria: 'acompanhamento', resumo: 'Espeto de coalho tostado na brasa com fio de melaço de cana.',
      rende: 6, tempo: 10, dificuldade: 1, combinaCom: ['picanha', 'cupim', 'fraldinha', 'linguica-toscana', 'coracao-frango'],
      ingredientes: [i(6, U, 'espetos de queijo coalho'), i(4, CS, 'melaço de cana'), i(null, AG, 'orégano seco')],
      passos: ['Asse o queijo a um palmo da brasa forte, virando até dourar (5-6 min).', 'Retire, regue com melaço e salpique orégano.', 'Sirva na hora.'],
      dica: 'Brasa forte e grelha limpa: queijo morno demais gruda.', tags: ['nordestino', 'vegetariano', 'brasa'] },

    { id: 'provoleta', nome: 'Provoleta', categoria: 'acompanhamento', resumo: 'Disco de provolone na parrilla com orégano e pimenta.',
      rende: 4, tempo: 12, dificuldade: 2, combinaCom: ['vazio', 'entrana', 'chorizo', 'morcilla', 'tira-de-asado', 'bife-de-chorizo'],
      ingredientes: [i(400, G, 'provolone em 2 discos de 2 cm'), i(1, CS, 'orégano seco'), i(null, AG, 'pimenta calabresa'), i(2, CS, 'azeite')],
      passos: ['Congele os discos 30 min antes para firmar.', 'Polvilhe orégano e leve em frigideira de ferro ou grelha untada, brasa média.', 'Doure 4-5 min, vire com espátula e doure mais 3 min.', 'Regue com azeite e sirva derretendo.'],
      dica: 'Queijo bem gelado forma crosta antes de escorrer.', tags: ['argentino', 'uruguaio', 'vegetariano'] },

    { id: 'legumes-brasa', nome: 'Legumes na brasa', categoria: 'acompanhamento', resumo: 'Abobrinha, pimentão, cebola e berinjela grelhados no azeite.',
      rende: 6, tempo: 25, dificuldade: 1, combinaCom: ['picanha', 'carre-cordeiro', 'ojo-de-bife', 'file-mignon', 'lombo-suino'],
      ingredientes: [i(2, U, 'abobrinhas em fatias longas'), i(1, U, 'berinjela em rodelas'), i(2, U, 'pimentões em tiras largas'), i(2, U, 'cebolas em rodelas grossas'), i(60, ML, 'azeite'), i(2, U, 'dentes de alho picados'), i(null, AG, 'sal grosso moído e pimenta')],
      passos: ['Misture azeite, alho, sal e pimenta.', 'Pincele os legumes.', 'Grelhe em brasa média 3-5 min de cada lado.', 'Regue com o resto do azeite temperado.'],
      dica: 'Fatias grossas não caem pela grelha e ficam suculentas.', tags: ['vegano', 'brasa', 'leve'] },

    { id: 'abacaxi-canela', nome: 'Abacaxi com canela na brasa', categoria: 'acompanhamento', resumo: 'Abacaxi caramelizado com açúcar e canela, sobremesa de churrasco.',
      rende: 8, tempo: 15, dificuldade: 1, combinaCom: ['lombo-suino', 'pancetta-suina', 'picanha', 'costelinha-suina', 'cupim'],
      ingredientes: [i(1, U, 'abacaxi em rodelas ou fatias compridas'), i(4, CS, 'açúcar mascavo'), i(1, CS, 'canela em pó')],
      passos: ['Misture açúcar e canela.', 'Passe o abacaxi na mistura.', 'Grelhe em brasa média 3-4 min de cada lado até caramelizar.', 'Sirva quente.'],
      dica: 'Espeto giratório? Coloque o abacaxi inteiro descascado e vá fatiando.', tags: ['sobremesa', 'brasa', 'vegano'] },

    // ---------- TEMPEROS ----------
    { id: 'sal-parrilla-ervas', nome: 'Sal de parrilla com ervas', categoria: 'tempero', resumo: 'Sal grosso moído com alecrim, tomilho e alho desidratado.',
      rende: 20, tempo: 10, dificuldade: 1, combinaCom: ['picanha', 'ancho', 'tomahawk', 'bife-de-chorizo', 'vazio', 'carre-cordeiro'],
      ingredientes: [i(200, G, 'sal grosso ou sal parrillero'), i(1, CS, 'alecrim seco'), i(1, CS, 'tomilho seco'), i(1, CS, 'alho desidratado em flocos'), i(1, CS, 'pimenta-do-reino em grão')],
      passos: ['Pulse tudo no pilão ou processador até grãos médios.', 'Guarde em pote fechado por até 3 meses.', 'Use ~10 g por kg de carne, antes de ir à brasa.'],
      dica: 'Uma porção = 10 g, o suficiente para ~1 kg de carne.', tags: ['seco', 'guarda bem'] },

    { id: 'salmoura-frango', nome: 'Salmoura para frango', categoria: 'tempero', resumo: 'Salmoura com açúcar e ervas que deixa o frango suculento.',
      rende: 8, tempo: 15, dificuldade: 1, combinaCom: ['coxa-sobrecoxa', 'asa-frango', 'coracao-frango'],
      ingredientes: [i(2000, ML, 'água fria'), i(120, G, 'sal refinado'), i(60, G, 'açúcar'), i(4, U, 'dentes de alho amassados'), i(2, U, 'folhas de louro'), i(1, CS, 'pimenta-do-reino em grão'), i(1, U, 'limão em rodelas')],
      passos: ['Dissolva sal e açúcar em 500 ml de água morna.', 'Complete com o resto da água fria e os aromáticos.', 'Mergulhe ~2 kg de frango na geladeira por 2-4 h (asas 1-2 h).', 'Escorra, seque bem e vá para a brasa sem salgar mais.'],
      dica: 'Proporção: 6% de sal na água; mais que 4 h deixa a carne salgada.', tags: ['frango', 'suculento'] },

    { id: 'salmoura-gaucha', nome: 'Salmoura gaúcha para pincelar', categoria: 'tempero', resumo: 'Água, sal e alho para pincelar a carne durante o assado.',
      rende: 10, tempo: 5, dificuldade: 1, combinaCom: ['costela', 'costela-janela', 'picanha', 'cupim', 'tira-de-asado'],
      ingredientes: [i(500, ML, 'água quente'), i(3, CS, 'sal'), i(4, U, 'dentes de alho amassados'), i(1, CS, 'orégano seco (opcional)')],
      passos: ['Dissolva o sal na água quente.', 'Junte alho e orégano e deixe amornar.', 'Pincele a carne com um ramo de alecrim ou salsinha durante o assado.'],
      dica: 'Ideal para costela fogo de chão: pincele a cada virada.', tags: ['gaúcho', 'salmoura'] },

    // ---------- BEBIDA ----------
    { id: 'clerico', nome: 'Clericó', categoria: 'bebida', resumo: 'Vinho branco com frutas picadas, refresco rioplatense.',
      rende: 8, tempo: 15, dificuldade: 1, combinaCom: ['vazio', 'entrana', 'chorizo', 'carre-cordeiro', 'lombo-suino'],
      ingredientes: [i(750, ML, 'vinho branco seco gelado'), i(500, ML, 'água com gás ou soda limonada'), i(2, X, 'frutas picadas (maçã, laranja, pêssego, morango)'), i(3, CS, 'açúcar'), i(null, AG, 'gelo')],
      passos: ['Misture frutas e açúcar e descanse 10 min.', 'Junte o vinho e gele por 1 h.', 'Na hora de servir, complete com a água com gás e gelo.'],
      dica: 'O gás entra no fim para não perder as bolhas.', tags: ['uruguaio', 'argentino', 'alcoólico'] }
  ];

  function arred(q, un) {
    if (un === 'unid.') return q < 1 ? Math.round(q * 2) / 2 || 0.5 : Math.round(q);
    if (un === 'colher (sopa)') return Math.max(0.5, Math.round(q * 2) / 2);
    if (un === 'xícara') return Math.max(0.25, Math.round(q * 4) / 4);
    if (un === 'g' || un === 'ml') {
      var p = q < 50 ? 5 : q < 500 ? 10 : 50;
      return Math.max(p, Math.round(q / p) * p);
    }
    return Math.round(q * 10) / 10;
  }

  window.escalarReceita = function (receita, porcoes) {
    var f = porcoes / receita.rende;
    return receita.ingredientes.map(function (ing) {
      return { q: ing.q == null ? null : arred(ing.q * f, ing.un), un: ing.un, item: ing.item };
    });
  };
})();
