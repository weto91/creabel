// Ajuda detalhada de cada página (pt-BR): o que aparece ao clicar em “?”. Cada entrada tem uma
// frase de abertura, seções [título, texto], dicas e o capítulo do guia do aplicativo
// onde o assunto é explicado com mais calma. As páginas que não estão aqui mostram só a frase curta
// (help.<seção> em i18n/pt-BR.js).
export default {
  home: {
    intro: 'O que vale a pena ver ao entrar: por onde continuar, como você está, quanto falta e o que precisa ser revisado.',
    parts: [
      ['Por onde continuar', 'A última cena em que você mexeu e a próxima a escrever, com acesso direto. “Continuar escrevendo” abre a primeira. Em um projeto novo, aqui ficam os primeiros passos.'],
      ['Quatro números', 'O manuscrito em relação à meta de palavras, o que você escreveu hoje em relação à cota diária, a sequência de dias seguidos e os dias que faltam para o prazo, com o ritmo de que você precisa e o ritmo atual.'],
      ['Ritmo e situação', 'As palavras de cada um dos últimos 30 dias e quantas fichas, capítulos e cenas estão a fazer, em andamento ou concluídos.'],
      ['Para revisar', 'As pendências abertas mais recentes e os avisos: impossibilidades e avisos de Continuidade, cenas sem data e cenas sem nenhuma trama.'],
    ],
    tips: ['As metas são definidas em “Livro → Metas”. Sem elas, os números mostram só o que existe.', 'Se você colocou uma capa ou uma frase de apresentação em “Livro”, elas aparecem no primeiro bloco; clique na capa para vê-la em tamanho grande.', 'No PC, clique com o botão direito em qualquer link → “Abrir em uma nova janela”: por exemplo, a ficha de um personagem ao lado da cena que você está escrevendo.', 'No celular, se você sair de uma cena para consultar algo, o botão ↩ lá em cima leva você de volta a ela.'],
    guide: 'path#home',
  },
  architecture: {
    intro: 'Os alicerces da história: o que você conta, em que mundo e por quais fios ela avança.',
    parts: [
      ['Premissa', 'A ideia em uma ou duas frases: quem quer o quê e o que o impede.'],
      ['Fábula, ambientação e notas', 'Os fatos em ordem cronológica, a época e o lugar, e as anotações que dizem respeito ao romance inteiro. Clique em cada bloco para escrevê-lo.'],
      ['Tramas', 'Um fio narrativo por linha, agrupados pelo peso: principais, subtramas e de fundo. A classificação é definida na ficha de cada trama.'],
      ['O percurso de cada trama', 'A barra tem um traço por cena do livro, em ordem de leitura; os coloridos são os dessa trama. Dá para ver onde ela começa, onde desaparece e se chega ao fim.'],
    ],
    tips: [
      'As cenas são atribuídas a uma trama na ficha da cena, bloco “Tramas e objetos”.',
      'O aviso “cenas sem nenhuma trama” aponta cenas que talvez não façam nada avançar.',
      '“Ler tudo” mostra a arquitetura de uma vez só, como um documento.',
      '“Importar / exportar”, ao lado de “Adicionar trama”, leva as tramas para Excel, CSV, Word, texto ou JSON e as traz de volta.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Anotações soltas do projeto: ideias, trechos, lembretes.',
    parts: [
      ['Etiquetas', 'Cada nota pode ter várias. Aqui elas são agrupadas por etiqueta, e uma nota com duas etiquetas aparece nos dois blocos.'],
      ['Cor', 'Oito cores para distingui-las num relance. “Ordenar por: Cor” as agrupa assim.'],
      ['Vínculos', 'Uma nota pode ser vinculada a personagens, lugares, objetos, grupos, fichas personalizadas, tramas, capítulos e cenas. Ela aparece então na ficha de cada um.'],
      ['Ordenar e manter', 'Dentro de cada bloco, as notas são reordenadas arrastando. O menu ⋯ de uma etiqueta a renomeia ou a remove de todas as notas.'],
    ],
    tips: ['Para material de consulta (links, plantas, artigos), é melhor usar Documentação; para o que precisa ser revisado, Pendências.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'O material de consulta do romance: links, artigos, imagens, mapas, plantas e documentos.',
    parts: [
      ['Referências', 'Cada uma tem um tipo, um endereço web opcional, um texto e arquivos anexados (imagens, SVG ou PDF).'],
      ['Vínculos', 'Uma referência é vinculada a cenas, capítulos ou fichas e aparece neles: assim você a tem à mão enquanto escreve aquela cena.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'As fichas de quem vive a história.',
    parts: [
      ['Principais e secundários', 'Os principais têm uma entrevista por seções (dados pessoais, aparência, psicologia, conflito, evolução…); os secundários, uma descrição livre. Dá para transformar um no outro pela ficha.'],
      ['Detecção no texto', 'Se você criar os personagens antes de escrever, as cenas os reconhecem pelo nome e pelos outros nomes e os marcam sozinhas.'],
      ['Datas e idade', 'Com a data de nascimento na ficha, cada cena com data mostra a idade do personagem.'],
      ['Relações', 'Quando algum personagem tem uma relação desenhada em “Relações”, aparece aqui uma aba que reúne todas.'],
    ],
    tips: ['“Importar / exportar” leva a lista para Excel, CSV, Word, texto ou JSON, e a traz de volta. Cada ficha vai inteira: dados, texto, traços, eventos, cenas em que aparece e relações.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'A ficha de um personagem principal: uma entrevista por seções que ajuda você a conhecê-lo.',
    parts: [
      ['Seções', 'Cada seção pode ser respondida pergunta por pergunta ou como texto livre. O status dela (a fazer, em andamento, concluído) mostra o que falta.'],
      ['Traços', 'São extraídos sozinhos do que você escreve (idade, cabelo, olhos…) para que você não se contradiga; você pode adicionar os seus.'],
      ['Papel, outros nomes e datas', 'O papel na história, as outras formas de chamá-lo (para que o texto o reconheça) e o nascimento e a morte.'],
      ['Relações', 'Um par por relação: embaixo da foto de cada um, o que ele é para o outro (“Diretor de voo” / “Comandante”). Se você escrever só um, vale para os dois (“Colegas”). É uma lista só, esteja a relação anotada aqui, na ficha do outro ou desenhada em um mapa; ao alterá-la ou removê-la, ela é atualizada em todos esses lugares.'],
      ['Imagens, eventos e aparições', 'Fotos de referência, fatos com data para a linha do tempo e as cenas em que aparece.'],
    ],
    tips: [
      'Se ele continuar aparecendo depois de morrer (o corpo, uma lembrança, um espectro), marque a caixa abaixo da data de morte e Continuidade não vai avisar.',
      'O menu ⋯ exporta a ficha ou importa dados para ela.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'Os cenários do romance, do maior ao menor.',
    parts: [
      ['Lista', 'As fichas de todos os lugares, que podem ser reordenadas arrastando.'],
      ['Árvore', 'Qual lugar está dentro de qual: a sala no convés, o convés na nave. O que acontece em um lugar conta também para os que o contêm.'],
      ['Mapas', 'Você envia uma planta ou um mapa (imagem ou SVG) e posiciona seus lugares sobre ele com alfinetes.'],
      ['Relações', 'Aparece quando algum lugar tem uma relação desenhada em “Relações”.'],
    ],
    tips: ['Na árvore, o menu ⋯ de cada linha move o lugar para dentro de outro ou adiciona lugares dentro dele.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'A ficha de um lugar.',
    parts: [
      ['Onde fica', 'País, estado ou região, cidade e “Dentro de”: o lugar que o contém. “Contém” lista os que estão dentro dele.'],
      ['Descrição e perguntas', 'O texto livre e as perguntas próprias que você tiver definido para todos os lugares.'],
      ['Aparições', 'As cenas que acontecem aqui ou em qualquer um dos lugares que ele contém.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Fichas dos tipos que você definir: naves, tecnologias, criaturas, organizações…',
    parts: [
      ['Tipos', '“Adicionar tipo” cria um tipo com nome, ícone e campos. Cada tipo é uma aba.'],
      ['Fichas', 'Têm os campos do seu tipo e, além disso, descrição, imagens e identificador.'],
      ['Como qualquer outro elemento', 'São marcadas nas cenas (bloco “Tramas e objetos”), aparecem na linha do tempo e na busca, e entram em Continuidade.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Como os elementos do romance se relacionam: o que você desenha e o que é deduzido sozinho.',
    parts: [
      ['Meus mapas', 'Você pode ter vários: a família, a tripulação, as facções. Cada um é uma tela.'],
      ['Elementos e setas', 'Em um mapa, você adiciona fichas (ou textos livres) e une duas delas com uma seta com rótulo: “mãe de”, “inimigo de”, “trabalha para”.'],
      ['Automáticas', 'Dez desenhos que saem sozinhos do que já foi anotado: quem coincide em cena, quem está com cada objeto, quem sabe cada segredo, o que um evento une, personagens e lugares, personagens e tramas, deslocamentos, grupos, lugares dentro de lugares e relações (todas as anotadas em fichas e mapas, mais os irmãos e avós deduzidos). Não ficam salvos: são recalculados ao abrir.'],
      ['Tudo junto', 'Um desenho geral com as suas (linha contínua) e as automáticas (tracejada, cada uma com sua cor), com caixas para escolher quais aparecem.'],
      ['Ler um desenho', 'Quanto mais grossa a linha, mais vezes a relação acontece. Passe o mouse sobre um elemento, ou clique nele para fixá-lo, e as relações dele ficam em destaque com o rótulo. Embaixo está a lista.'],
      ['Vê-las nas fichas', 'Personagens e Lugares têm uma aba “Relações” que reúne as de todos os seus mapas.'],
    ],
    tips: ['“Exportar relações” as leva para Word, texto, Excel, CSV ou JSON.', 'Uma seta “mãe”, “pai” ou “filho” entre dois personagens também serve para que Continuidade verifique as datas de nascimento deles.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'A estrutura do romance: partes, capítulos, prólogo e epílogo.',
    parts: [
      ['A lista', 'Cada capítulo com as cenas, as palavras, o tempo de leitura, o status, os personagens com mais presença e um quadradinho colorido para cada trama que ele toca. No alto, o total do livro.'],
      ['Tempo de leitura', 'Aproximado, a cerca de 250 palavras por minuto. Dentro de cada capítulo aparece também o de cada cena.'],
      ['As tramas', 'Passe o mouse sobre um quadradinho (ou mantenha pressionado em uma tela sensível ao toque) para ver o nome da trama, o tipo e a descrição.'],
      ['Reordenar', 'Arraste as linhas, use Alt+↑/↓ ou o menu ⋯ de cada uma.'],
      ['Outras visualizações', '“Quadro” mostra as cenas como cartões para movê-las entre capítulos; “Esquema”, tudo em uma árvore.'],
    ],
    tips: ['“Estrutura” adiciona partes, prólogo ou epílogo, importa um rascunho do Word e detecta menções em todas as cenas.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Um capítulo: as cenas e as anotações dele.',
    parts: [
      ['Cenas', 'São criadas, reordenadas arrastando e movidas para outro capítulo pelo menu ⋯ de cada uma. Abaixo do título de cada cena: quando acontece e quanto dura, quem narra e um quadradinho colorido para cada lugar (passe o mouse, ou mantenha pressionado, para ver qual é).'],
      ['Motivo e notas', 'Para que serve o capítulo no romance e o que você quiser lembrar ao escrevê-lo.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'Onde se escreve. À esquerda, o texto; à direita, a ficha da cena.',
    parts: [
      ['O texto', 'É salvo sozinho. A barra traz formatação, travessão de diálogo e aspas, buscar e substituir, e marcar uma pendência no trecho selecionado.'],
      ['A ficha', 'Em blocos que se recolhem: quem aparece e quem narra, onde e quando, eventos, tramas e objetos, continuidade, pendências, documentação e revisões.'],
      ['Eventos', 'O bloco “Eventos” mostra os fatos relacionados à cena: os que acontecem nela (assumem a data dela) e os que são contados nela (uma lembrança: mantêm a própria data). Recolhido, diz quais são; aberto, mostra de cada um a data, a descrição, quem envolve e em quais outras cenas está.'],
      ['Detecção automática', 'O que você cita no texto (personagens, lugares, objetos, grupos) é marcado sozinho, com a palavra “auto”. Se você remover, não volta a ser adicionado.'],
      ['Revisões', 'Versões do texto da cena. Você pode criar uma nova antes de reescrever, compará-las e voltar a uma anterior.'],
      ['Ferramentas', 'Na barra: tela dividida (uma ficha ou outra cena ao lado), revisão de estilo, leitura em voz alta e modo sem distrações.'],
      ['Continuidade', 'Anote aqui o que muda de estado (“ferida no braço”, “a chave passa para Álex”) e qual segredo é revelado, e a quem.'],
    ],
    tips: ['Ctrl+S salva na hora; Ctrl+F busca; Esc sai do modo sem distrações.', 'A data da cena a coloca na linha do tempo e permite calcular idades e detectar impossibilidades.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'As cenas como cartões, para ver o romance num relance e reorganizá-lo.',
    parts: [
      ['Colunas e cartões', 'Cada capítulo é uma coluna (quatro por linha) e cada cena um cartão com o resumo, quem narra, onde e quando.'],
      ['Resumo', 'Clique no texto de um cartão para escrever do que trata a cena.'],
      ['Mover', 'Arraste um cartão para mudá-lo de lugar ou de capítulo. Em telas sensíveis ao toque, use o menu ⋯ dele.'],
      ['Tramas', 'Os traços coloridos são as tramas da cena; a legenda no alto diz qual é cada uma.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Tudo o que descreve o romance como livro.',
    parts: [
      ['Dados do livro', 'Título e idioma (obrigatórios) e autoria, série, número, data de publicação, editora, capa e sinopse (opcionais). Aparecem na folha de rosto e nos metadados do e-book.'],
      ['Metas', 'Meta de palavras, cota diária, prazo e palavras por capítulo. São acompanhadas no início.'],
      ['Páginas do livro', 'Créditos, dedicatória, epígrafe, agradecimentos e “Sobre o autor” com a foto. São adicionados ao exportar.'],
      ['Projeto', 'Backup (um .zip com todos os dados, as imagens e os documentos, além do livro e das fichas em Word), criar uma continuação (mantém o mundo, começa sem capítulos) e apagar o projeto. O backup é restaurado com “Importar backup” em “Seus projetos”.'],
    ],
    tips: ['Sem autoria, o livro é exportado como “Anônimo”.'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'O que falta revisar, em um só lugar.',
    parts: [
      ['De onde vêm', 'De uma marca no texto de uma cena, ou soltas, ligadas a uma ficha ou ao projeto.'],
      ['Tipos e situação', 'Cada pendência tem um tipo (revisar, verificar, pesquisar…) e é marcada como resolvida quando estiver.'],
      ['Ir até o lugar', 'De uma pendência marcada no texto, você pula direto para a frase exata da cena.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'Os fatos em ordem: as cenas com data e os eventos do mundo.',
    parts: [
      ['O que aparece', 'Uma cena aparece quando você coloca a data na ficha dela. Um evento é criado aqui ou na ficha de um elemento, e pode ser geral ou de um ou vários elementos.'],
      ['Eventos e cenas', 'Um evento é vinculado às cenas em que acontece (assume a data delas e aparece dentro delas) ou àquelas em que só é contado (mantém a própria data). Se um evento solto coincidir em data e hora com uma cena, um aviso sugere vinculá-los.'],
      ['Duas ordens', '“Cronológica” ordena por data; “De leitura”, como no livro, para ver onde o relato volta no tempo.'],
      ['Onde o livro começa e termina', 'Duas marcas assinalam a primeira e a última cena que o leitor lê: o que vem antes é passado anterior ao romance.'],
      ['Seguir e filtros', '“Seguir” deixa a linha em um único elemento; as caixas ocultam tipos de entrada.'],
      ['Busca', 'Por texto, data ou identificador. “a & b” exige as duas coisas; “a | b”, uma delas. O “?” ao lado dá exemplos.'],
      ['Importar e exportar', 'Para CSV, JSON, Excel ou Word, e de volta: cria os eventos que faltarem e atualiza os que já existem.'],
    ],
    tips: ['Entre duas entradas aparece o tempo que passa; ao passar o mouse, ele aparece detalhado.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Para não se contradizer: impossibilidades que podem ser detectadas, quem sabe cada coisa e como cada elemento muda.',
    parts: [
      ['Verificações', 'Cruza datas e lugares das cenas, personagens presentes, nascimentos e mortes, estados e segredos. Avisa, por exemplo, de alguém em dois lugares ao mesmo tempo.'],
      ['Impossível ou para revisar', 'O que não pode acontecer aparece como “Impossível”; o que pode ser intencional, como “Para revisar”. Cada aviso pode ser ignorado.'],
      ['Quem sabe o quê', 'Os segredos do romance, um por linha, e em qual cena cada personagem e o leitor ficam sabendo. São ordenados pela primeira revelação (por data ou por ordem de leitura), e a busca encontra por título, conteúdo, pessoa ou cena. Clique em uma linha para ver o detalhe.'],
      ['Acompanhamento', 'Percorre o livro seguindo um elemento: onde aparece e como vai mudando de estado.'],
    ],
    tips: ['Os estados e as revelações são anotados na ficha de cada cena, bloco “Continuidade”.', 'Quanto mais você preencher (datas, lugares, nascimentos), mais coisas aparecem.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Medidas do manuscrito e do seu jeito de escrevê-lo.',
    parts: [
      ['Minha escrita', 'Palavras por dia, sequências, sessões e previsão de término.'],
      ['O livro', 'Extensão de capítulos e cenas, proporção de diálogo e narração, e repetições.'],
      ['Estilo', 'Advérbios em -mente, repetições próximas, muletas e frases longas, por capítulo; destaca onde há mais. Segue as regras do idioma do romance.'],
      ['Gráfico narrativo', 'Uma linha por elemento e uma coluna por cena: quem some por tempo demais e quais tramas não se cruzam.'],
      ['Distribuição e aparições', 'Em quantas cenas de cada capítulo cada elemento aparece, e a lista de cenas de um personagem.'],
    ],
    tips: ['O “?” ao lado de cada coluna explica o que ela mede.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Busque (e substitua) no projeto inteiro.',
    parts: [
      ['Onde busca', 'Marque os âmbitos: texto das cenas, títulos, personagens, mundo, arquitetura e notas, documentação e pendências.'],
      ['Opções', 'Diferenciar maiúsculas e buscar só palavras inteiras.'],
      ['Substituir', 'Troca o texto em tudo o que estiver marcado, depois de dizer em quantos lugares. Útil para renomear um personagem.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Leva o romance ou o material de trabalho para um arquivo.',
    parts: [
      ['O que exportar', 'O romance ou o dossiê (arquitetura, personagens, lugares e as demais fichas).'],
      ['Tipos de exportação', 'Manuscrito para enviar, livro impresso (com estimativa de páginas e lombada), livro digital (EPUB) ou formato livre.'],
      ['Formatos', 'Word, EPUB, página web ou PDF, e texto.'],
      ['Dados e páginas do livro', 'A folha de rosto, os metadados do e-book, a capa e as páginas iniciais e finais vêm de “Livro”.'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'O que você apaga não se perde na hora: vem para cá.',
    parts: [
      ['Restaurar', 'Devolve um elemento ao lugar dele, com o que dependia dele.'],
      ['Validade', 'Passados os dias que você definir nas Configurações (entre 1 e 60), é apagado definitivamente.'],
    ],
    guide: 'data#trash',
  },
};
