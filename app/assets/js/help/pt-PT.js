// Ajuda detalhada de cada página (pt-PT): o que aparece ao premir «?». Cada entrada tem uma
// frase de abertura, secções [título, texto], dicas e o capítulo do guia da aplicação
// onde se explica com mais calma. As páginas que não estão aqui mostram apenas a frase curta
// (help.<secção> em i18n/pt-PT.js).
export default {
  home: {
    intro: 'O que convém ver ao entrar: por onde continuar, como vai, quanto falta e o que é preciso rever.',
    parts: [
      ['Por onde continuar', 'A última cena em que mexeu e a próxima por escrever, com acesso direto. «Continuar a escrever» abre a primeira. Num projeto novo, aqui estão os primeiros passos.'],
      ['Quatro números', 'O manuscrito em relação à meta de palavras, o que escreveu hoje em relação à quota diária, a sequência de dias seguidos e os dias que faltam para o prazo de entrega, com o ritmo de que precisa e o que leva.'],
      ['Ritmo e estado', 'As palavras de cada um dos últimos 30 dias e quantas fichas, capítulos e cenas estão por fazer, em curso ou concluídos.'],
      ['Para rever', 'Os pendentes abertos mais recentes e os avisos: impossibilidades e avisos da Continuidade, cenas sem data e cenas sem nenhuma trama.'],
    ],
    tips: ['As metas definem-se em «Livro → Objetivos». Sem elas, os números mostram apenas o que existe.', 'Se tiver posto uma capa ou uma frase de apresentação em «Livro», aparecem no primeiro bloco; clique na capa para a ver em grande.', 'No PC, clique com o botão direito em qualquer ligação → «Abrir numa nova janela»: por exemplo, a ficha de uma personagem ao lado da cena que está a escrever.', 'No telemóvel, se sair de uma cena para consultar algo, o botão ↩ no topo leva-o de volta a ela.'],
    guide: 'path#home',
  },
  architecture: {
    intro: 'Os alicerces da história: o que conta, em que mundo e por que fios avança.',
    parts: [
      ['Premissa', 'A ideia numa ou duas frases: quem quer o quê e o que o impede.'],
      ['Fábula, ambientação e notas', 'Os factos por ordem cronológica, a época e o lugar, e os apontamentos que dizem respeito a todo o romance. Prima cada bloco para o escrever.'],
      ['Tramas', 'Um fio narrativo por linha, agrupados pelo seu peso: principais, subtramas e de fundo. A classificação define-se na ficha de cada trama.'],
      ['O percurso de cada trama', 'A barra tem uma risca por cada cena do livro, por ordem de leitura; as coloridas são as dessa trama. Vê-se onde começa, onde desaparece e se chega ao fim.'],
    ],
    tips: [
      'As cenas atribuem-se a uma trama na ficha da cena, bloco «Tramas e objetos».',
      'O aviso «cenas sem nenhuma trama» assinala cenas que talvez não façam avançar nada.',
      '«Ler tudo» mostra a arquitetura de seguida, como um documento.',
      '«Importar / exportar», junto a «Adicionar trama», tira as tramas para Excel, CSV, Word, texto ou JSON e volta a trazê-las.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Apontamentos soltos do projeto: ideias, excertos, lembretes.',
    parts: [
      ['Etiquetas', 'Cada nota pode ter várias. Aqui agrupam-se por etiqueta, e uma nota com duas etiquetas aparece nos dois blocos.'],
      ['Cor', 'Oito cores para as distinguir num relance. «Ordenar por: Cor» agrupa-as assim.'],
      ['Associações', 'Uma nota pode ser associada a personagens, lugares, objetos, grupos, fichas personalizadas, tramas, capítulos e cenas. Passa então a aparecer na ficha de cada um.'],
      ['Ordenar e manter', 'Dentro de cada bloco, reordenam-se arrastando. O menu ⋯ de uma etiqueta muda-lhe o nome ou remove-a de todas as notas.'],
    ],
    tips: ['Para material de consulta (ligações, plantas, artigos) é melhor a Documentação; para o que é preciso rever, os Pendentes.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'O material de consulta do romance: ligações, artigos, imagens, mapas, plantas e documentos.',
    parts: [
      ['Referências', 'Cada uma tem um tipo, um endereço web opcional, um texto e ficheiros anexos (imagens, SVG ou PDF).'],
      ['Associações', 'Uma referência associa-se a cenas, capítulos ou fichas, e aparece neles: assim tem-na à mão enquanto escreve essa cena.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'As fichas de quem vive a história.',
    parts: [
      ['Principais e secundárias', 'As personagens principais têm uma entrevista por secções (dados pessoais, aspeto físico, psicologia, conflito, evolução…); as secundárias, uma descrição livre. Pode converter-se uma na outra a partir da ficha.'],
      ['Deteção no texto', 'Se criar as personagens antes de escrever, as cenas reconhecem-nas pelo nome e pelos outros nomes e marcam-nas automaticamente.'],
      ['Datas e idade', 'Com a data de nascimento na ficha, cada cena com data mostra a idade da personagem.'],
      ['Relações', 'Quando alguma personagem tem uma relação desenhada em «Relações», aparece aqui um separador que as reúne a todas.'],
    ],
    tips: ['«Importar / exportar» tira a lista para Excel, CSV, Word, texto ou JSON, e volta a trazê-la. Cada ficha vai completa: dados, texto, traços, eventos, cenas em que aparece e relações.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'A ficha de uma personagem principal: uma entrevista por secções que o ajuda a conhecê-la.',
    parts: [
      ['Secções', 'Cada secção pode ser respondida pergunta a pergunta ou como texto livre. O estado (por fazer, em curso, concluído) diz-lhe o que falta.'],
      ['Traços', 'São extraídos automaticamente do que escreve (idade, cabelo, olhos…) para que não se contradiga; pode adicionar os seus.'],
      ['Papel, outros nomes e datas', 'O papel na história, as outras formas de a chamar (para que o texto a reconheça) e o nascimento e a morte.'],
      ['Relações', 'Um par por relação: por baixo da fotografia de cada um, o que é para o outro («Diretor de voo» / «Comandante»). Se escrever só um, serve para os dois («Colegas»). É uma única lista, quer a relação esteja anotada aqui, na ficha do outro ou desenhada num mapa; ao alterá-la ou removê-la, é atualizada em todos esses sítios.'],
      ['Imagens, eventos e aparições', 'Fotografias de referência, factos com data para a cronologia e as cenas em que aparece.'],
    ],
    tips: [
      'Se continuar a aparecer depois de morrer (o corpo, uma recordação, um espectro), marque a caixa por baixo da data de morte e a Continuidade não avisará.',
      'O menu ⋯ exporta a ficha ou importa dados para ela.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'Os cenários do romance, do maior ao mais pequeno.',
    parts: [
      ['Lista', 'As fichas de todos os lugares, que se reordenam arrastando.'],
      ['Árvore', 'Que lugar está dentro de qual: a sala no convés, o convés na nave. O que acontece num lugar conta também para os que o contêm.'],
      ['Mapas', 'Carrega uma planta ou um mapa (imagem ou SVG) e coloca os seus lugares por cima com alfinetes.'],
      ['Relações', 'Aparece quando algum lugar tem uma relação desenhada em «Relações».'],
    ],
    tips: ['Na árvore, o menu ⋯ de cada linha move o lugar para dentro de outro ou adiciona-lhe lugares dentro.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'A ficha de um lugar.',
    parts: [
      ['Onde fica', 'País, região e cidade, e «Dentro de»: o lugar que o contém. «Contém» lista os que tem dentro.'],
      ['Descrição e perguntas', 'O texto livre e as perguntas próprias que tiver definido para todos os lugares.'],
      ['Aparições', 'As cenas que decorrem aqui ou em qualquer um dos lugares que contém.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Fichas dos tipos que definir: naves, tecnologias, criaturas, organizações…',
    parts: [
      ['Tipos', '«Adicionar tipo» cria um com nome, ícone e campos. Cada tipo é um separador.'],
      ['Fichas', 'Têm os campos do seu tipo e, além disso, descrição, imagens e identificador.'],
      ['Como mais um elemento', 'Marcam-se nas cenas (bloco «Tramas e objetos»), aparecem na cronologia e na pesquisa, e entram na Continuidade.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'Como se relacionam os elementos do romance: o que desenha e o que se deduz automaticamente.',
    parts: [
      ['Os meus mapas', 'Pode ter vários: a família, a tripulação, as fações. Cada um é uma tela.'],
      ['Elementos e setas', 'Num mapa, adiciona fichas (ou textos livres) e une duas com uma seta com etiqueta: «mãe de», «inimigo de», «trabalha para».'],
      ['Automáticas', 'Dez desenhos que resultam automaticamente do que já está anotado: quem coincide em cena, quem tem cada objeto, quem sabe cada segredo, o que um evento une, personagens e lugares, personagens e tramas, deslocações, grupos, lugares dentro de lugares e relações (todas as anotadas em fichas e mapas, mais os irmãos e avós que se deduzem). Não são guardados: são recalculados ao abrir.'],
      ['Tudo junto', 'Um desenho geral com as suas (linha contínua) e as automáticas (a tracejado, cada uma da sua cor), com caixas para escolher quais se veem.'],
      ['Ler um desenho', 'Quanto mais grossa a linha, mais vezes se verifica a relação. Passe o rato por cima de um elemento, ou prima-o para o fixar, e as relações dele ficam realçadas com o respetivo rótulo. Por baixo está a lista.'],
      ['Vê-las nas fichas', 'Personagens e Lugares têm um separador «Relações» que reúne as de todos os seus mapas.'],
    ],
    tips: ['«Exportar relações» tira-as para Word, texto, Excel, CSV ou JSON.', 'Uma seta «mãe», «pai» ou «filho» entre duas personagens serve também para a Continuidade verificar as datas de nascimento.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'A estrutura do romance: partes, capítulos, prólogo e epílogo.',
    parts: [
      ['A lista', 'Cada capítulo com as suas cenas, palavras, tempo de leitura, estado, as personagens com mais presença e um quadrado colorido por cada trama em que toca. Em cima, o total do livro.'],
      ['Tempo de leitura', 'Aproximado, a cerca de 250 palavras por minuto. Dentro de cada capítulo aparece também o de cada cena.'],
      ['As tramas', 'Passe o rato por cima de um quadrado (ou mantenha premido num ecrã tátil) para ver o nome da trama, o tipo e a descrição.'],
      ['Reordenar', 'Arraste as linhas, use Alt+↑/↓ ou o menu ⋯ de cada uma.'],
      ['Outras vistas', '«Quadro» mostra as cenas como cartões para as mover entre capítulos; «Esquema», tudo numa árvore.'],
    ],
    tips: ['«Estrutura» adiciona partes, prólogo ou epílogo, importa um rascunho em Word e deteta menções em todas as cenas.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'Um capítulo: as suas cenas e os seus apontamentos.',
    parts: [
      ['Cenas', 'Criam-se, reordenam-se arrastando e movem-se para outro capítulo a partir do respetivo menu ⋯. Por baixo do título de cada uma: quando acontece e quanto dura, quem narra e um quadrado colorido por cada lugar (passe o rato, ou mantenha premido, para ver qual é).'],
      ['Motivo e notas', 'Para que serve o capítulo no romance e o que quiser lembrar ao escrevê-lo.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'Onde se escreve. À esquerda, o texto; à direita, a ficha da cena.',
    parts: [
      ['O texto', 'É guardado automaticamente. A barra dá formatação, travessão de diálogo e aspas, localizar e substituir, e marcar um pendente no texto selecionado.'],
      ['A ficha', 'Por blocos recolhíveis: quem aparece e quem narra, onde e quando, eventos, tramas e objetos, continuidade, pendentes, documentação e revisões.'],
      ['Eventos', 'O bloco «Eventos» mostra os factos que têm a ver com a cena: os que acontecem nela (ficam com a data dela) e os que nela são contados (uma recordação: mantêm a sua). Recolhido, diz quais são; aberto, dá de cada um a data, a descrição, a quem diz respeito e em que outras cenas está.'],
      ['Deteção automática', 'O que nomear no texto (personagens, lugares, objetos, grupos) é marcado automaticamente, com a palavra «auto». Se o remover, não volta a ser adicionado.'],
      ['Revisões', 'Versões do texto da cena. Pode criar uma nova antes de reescrever, compará-las e voltar a uma anterior.'],
      ['Ferramentas', 'Na barra: vista dividida (uma ficha ou outra cena ao lado), revisão de estilo, ler em voz alta e modo sem distrações.'],
      ['Continuidade', 'Anote aqui o que muda de estado («ferida no braço», «a chave passa para o Álex») e que segredo é revelado, e a quem.'],
    ],
    tips: ['Ctrl+S guarda de imediato; Ctrl+F localiza; Esc sai do modo sem distrações.', 'A data da cena coloca-a na cronologia e permite calcular idades e detetar impossibilidades.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'As cenas como cartões, para ver o romance num relance e reorganizá-lo.',
    parts: [
      ['Colunas e cartões', 'Cada capítulo é uma coluna (quatro por linha) e cada cena um cartão com o seu resumo, quem narra, onde e quando.'],
      ['Resumo', 'Prima o texto de um cartão para escrever de que trata a cena.'],
      ['Mover', 'Arraste um cartão para o mudar de sítio ou de capítulo. Em ecrãs táteis, use o respetivo menu ⋯.'],
      ['Tramas', 'As riscas coloridas são as tramas da cena; a legenda em cima diz qual é cada uma.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Tudo o que descreve o romance enquanto livro.',
    parts: [
      ['Dados do livro', 'Título e idioma (obrigatórios) e autor, série, número, data de publicação, editora, capa e sinopse (opcionais). Aparecem na folha de rosto e nos metadados do livro eletrónico.'],
      ['Objetivos', 'Meta de palavras, quota diária, prazo de entrega e palavras por capítulo. Acompanham-se a partir do início.'],
      ['Páginas do livro', 'Créditos, dedicatória, citação, agradecimentos e «Sobre o autor» com a respetiva fotografia. São adicionados ao exportar.'],
      ['Projeto', 'Cópia de segurança (um .zip com todos os dados, as imagens e os documentos, e o livro e as fichas em Word), criar uma sequela (mantém o mundo, começa sem capítulos) e apagar o projeto. A cópia restaura-se com «Importar cópia» em «Os seus projetos».'],
    ],
    tips: ['Sem autor, o livro é exportado como «Anónimo».'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'O que falta rever, num só sítio.',
    parts: [
      ['De onde vêm', 'De uma marca no texto de uma cena, ou soltos, ligados a uma ficha ou ao projeto.'],
      ['Tipos e estado', 'Cada pendente tem um tipo (rever, verificar, documentar-se…) e marca-se como resolvido quando o estiver.'],
      ['Ir ao sítio', 'A partir de um pendente marcado no texto, salta-se para a frase exata da cena.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'Os factos por ordem: as cenas com data e os eventos do mundo.',
    parts: [
      ['O que aparece', 'Uma cena aparece quando lhe põe data na ficha. Um evento cria-se aqui ou na ficha de um elemento, e pode ser geral ou de um ou vários elementos.'],
      ['Eventos e cenas', 'Um evento associa-se às cenas em que acontece (fica com a data delas e aparece dentro delas) ou àquelas em que é apenas contado (mantém a sua). Se um evento solto coincidir em data e hora com uma cena, um aviso propõe associá-los.'],
      ['Duas ordens', '«Cronológica» ordena por data; «De leitura», como no livro, para ver onde o relato recua no tempo.'],
      ['Começo e fim do livro', 'Duas marcas assinalam a primeira e a última cena que o leitor lê: o que vem antes é passado anterior ao romance.'],
      ['Seguir e filtros', '«Seguir» deixa a cronologia num só elemento; as caixas ocultam tipos de entrada.'],
      ['Pesquisa', 'Por texto, data ou identificador. «a & b» exige as duas coisas; «a | b», uma delas. O «?» ao lado dá exemplos.'],
      ['Importar e exportar', 'Para CSV, JSON, Excel ou Word, e de volta: cria os eventos que faltem e atualiza os que já existem.'],
    ],
    tips: ['Entre duas entradas indica-se o tempo que passa; ao passar o rato aparece discriminado.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'Para não se contradizer: impossibilidades que se podem detetar, quem sabe cada coisa e como muda cada elemento.',
    parts: [
      ['Verificações', 'Cruza datas e lugares das cenas, personagens presentes, nascimentos e mortes, estados e segredos. Avisa, por exemplo, de alguém em dois sítios ao mesmo tempo.'],
      ['Impossível ou para rever', 'O que não pode ser aparece como «Impossível»; o que pode ser intencional, como «Para rever». Cada aviso pode ser ignorado.'],
      ['Quem sabe o quê', 'Os segredos do romance, um por linha, e em que cena cada personagem e o leitor ficam a saber. Ordenam-se pela primeira revelação (por data ou por ordem de leitura), e a pesquisa encontra-os por título, conteúdo, pessoa ou cena. Prima uma linha para ver o pormenor.'],
      ['Acompanhamento', 'Percorre o livro seguindo um elemento: onde aparece e como vai mudando de estado.'],
    ],
    tips: ['Os estados e as revelações anotam-se na ficha de cada cena, bloco «Continuidade».', 'Quanto mais completar (datas, lugares, nascimentos), mais encontra.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Medidas do manuscrito e da sua forma de o escrever.',
    parts: [
      ['A minha escrita', 'Palavras por dia, sequências, sessões e previsão do fim.'],
      ['O livro', 'Extensão de capítulos e cenas, proporção de diálogo e narração, e repetições.'],
      ['Estilo', 'Advérbios em -mente, repetições próximas, muletas e frases longas, por capítulo; realça onde há mais. Segue as regras do idioma do romance.'],
      ['Gráfico narrativo', 'Uma linha por elemento e uma coluna por cena: quem desaparece durante demasiado tempo e que tramas não se cruzam.'],
      ['Distribuição e aparições', 'Em quantas cenas de cada capítulo aparece cada elemento, e a lista de cenas de uma personagem.'],
    ],
    tips: ['O «?» junto a cada coluna explica o que mede.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Pesquise (e substitua) em todo o projeto.',
    parts: [
      ['Onde pesquisa', 'Marque os âmbitos: texto das cenas, títulos, personagens, mundo, arquitetura e notas, documentação e pendentes.'],
      ['Opções', 'Distinguir maiúsculas e pesquisar apenas palavras inteiras.'],
      ['Substituir', 'Muda o texto em tudo o que estiver marcado, depois de lhe dizer em quantos sítios. Útil para mudar o nome de uma personagem.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Tire o romance ou o material de trabalho para um ficheiro.',
    parts: [
      ['O que exportar', 'O romance ou o dossier (arquitetura, personagens, lugares e restantes fichas).'],
      ['Tipos de exportação', 'Manuscrito para enviar, livro impresso (com estimativa de páginas e lombada), livro eletrónico (EPUB) ou formato livre.'],
      ['Formatos', 'Word, EPUB, página web ou PDF, e texto.'],
      ['Dados e páginas do livro', 'A folha de rosto, os metadados do livro eletrónico, a capa e as páginas preliminares e finais vêm de «Livro».'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'O que é apagado não se perde de imediato: vem para aqui.',
    parts: [
      ['Restaurar', 'Devolve um elemento ao seu lugar, com o que dependia dele.'],
      ['Prazo', 'Passados os dias que definir nas Definições (entre 1 e 60), é eliminado definitivamente.'],
    ],
    guide: 'data#trash',
  },
};
