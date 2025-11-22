
import type { Meal } from '../../types';

export interface Recipe extends Omit<Meal, 'id' | 'time'> {
  id: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  tags: string[]; 
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink';
  prepTime: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  image: string;
  rating?: number;
}

export const RECIPES_DATABASE: Recipe[] = [
  // --- PDF: LOW CARB ---
  {
    id: 'pizza-couve-flor',
    name: 'Pizza de Couve-Flor',
    description: 'Massa leve e crocante sem farinha de trigo. Baixíssimo carboidrato e rica em fibras.',
    calories: 229,
    protein: 18,
    prepTime: '50 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop',
    category: 'dinner',
    rating: 4.8,
    tags: ['low-carb', 'sem glúten', 'vegetariano', 'jantar', 'pizza'],
    ingredients: [
      '1 couve-flor grande limpa (apenas floretes)',
      '1 colher (sopa) de queijo parmesão ralado',
      '1 colher (sopa) de mussarela ralada',
      '2 ovos',
      '1 dente de alho picado',
      'Sal, pimenta e orégano a gosto',
      'Molho de tomate caseiro e cobertura a gosto'
    ],
    instructions: [
      'Triture a couve-flor no processador. Leve ao micro-ondas por 10 min.',
      'Espere amornar e coloque em um pano limpo. Esprema bem para tirar TODA a água. Esse passo é crucial para a crocância.',
      'Misture a couve-flor seca com os ovos, queijos e temperos até formar uma massa.',
      'Abra em uma forma de pizza untada e asse a 180ºC por 15-20 min até dourar.',
      'Recheie e volte ao forno apenas para derreter o queijo.'
    ]
  },
  {
    id: 'pao-frigideira-lowcarb',
    name: 'Pão de Frigideira Low Carb',
    description: 'Substituto rápido do pão para o café da manhã, pronto em minutos.',
    calories: 219,
    protein: 10,
    prepTime: '10 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1619850956635-50a4f0b919c0?q=80&w=1000&auto=format&fit=crop',
    category: 'breakfast',
    rating: 4.5,
    tags: ['low-carb', 'café da manhã', 'rápido', 'sem glúten', 'pão'],
    ingredients: [
      '1 ovo',
      '1 colher (sopa) de farinha de amêndoas',
      '1 colher (sopa) de farinha de linhaça',
      '1 colher (sopa) de água',
      '1 colher (café) de fermento em pó',
      'Sal e orégano a gosto'
    ],
    instructions: [
      'Bata o ovo bem com um garfo em uma tigela pequena.',
      'Adicione as farinhas, a água e os temperos. Misture bem até ficar homogêneo.',
      'Por último, adicione o fermento.',
      'Despeje em uma frigideira pequena untada e dourada dos dois lados em fogo baixo.'
    ]
  },
  {
    id: 'lasanha-abobrinha',
    name: 'Lasanha de Abobrinha',
    description: 'Clássico low carb substituindo a massa por lâminas de abobrinha. Leve e saborosa.',
    calories: 320,
    protein: 25,
    prepTime: '40 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?q=80&w=1000&auto=format&fit=crop',
    category: 'lunch',
    rating: 4.9,
    tags: ['low-carb', 'sem glúten', 'proteico', 'almoço', 'conforto'],
    ingredients: [
      '2 abobrinhas médias fatiadas no sentido do comprimento',
      '300g de carne moída magra (patinho) refogada',
      'Molho de tomate caseiro',
      '200g de queijo mussarela light ou ricota',
      'Temperos a gosto'
    ],
    instructions: [
      'Grelhe levemente as fatias de abobrinha na frigideira para retirar a água.',
      'Em um refratário, alterne camadas de molho, abobrinha, carne e queijo.',
      'Repita as camadas.',
      'Finalize com queijo e leve ao forno para gratinar por 20 minutos.'
    ]
  },
  
  // --- PDF: VEGANOS & SAUDÁVEIS ---
  {
    id: 'brownie-feijao',
    name: 'Brownie de Feijão Preto',
    description: 'Surpreendente, úmido e rico em fibras e ferro. Sem gosto de feijão!',
    calories: 180,
    protein: 6,
    prepTime: '40 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476d?q=80&w=1000&auto=format&fit=crop',
    category: 'dessert',
    rating: 4.7,
    tags: ['vegano', 'sem glúten', 'fibras', 'sobremesa', 'chocolate'],
    ingredients: [
      '1 e 1/2 xícara de feijão preto cozido (sem tempero e sem caldo)',
      '1/2 xícara de açúcar demerara ou xilitol',
      '1/2 xícara de cacau em pó 100%',
      '3 colheres (sopa) de óleo de coco',
      '1 colher (chá) de fermento',
      'Nozes picadas (opcional)'
    ],
    instructions: [
      'Bata o feijão, o óleo, o cacau e o açúcar no processador até virar um creme liso.',
      'Misture o fermento delicadamente.',
      'Coloque em uma forma pequena untada com cacau.',
      'Asse a 180ºC por 20-25 minutos. A textura fica úmida por dentro.'
    ]
  },
  {
    id: 'hamburguer-feijao',
    name: 'Hambúrguer de Feijão',
    description: 'Alternativa vegetal rica em proteínas e ferro. Ideal para congelar.',
    calories: 210,
    protein: 12,
    prepTime: '30 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop',
    category: 'lunch',
    rating: 4.6,
    tags: ['vegano', 'proteico', 'almoço', 'fibras', 'lanche'],
    ingredients: [
      '2 xícaras de feijão preto cozido e escorrido',
      '1/2 cebola picada',
      '1/2 xícara de farinha de aveia ou arroz',
      'Alho, cominho, páprica e sal a gosto',
      'Azeite para grelhar'
    ],
    instructions: [
      'Amasse o feijão com um garfo (não precisa virar pasta total).',
      'Misture a cebola, temperos e a farinha até dar liga.',
      'Modele os hambúrgueres com as mãos.',
      'Grelhe em uma frigideira antiaderente com um fio de azeite até dourar dos dois lados.'
    ]
  },
  {
    id: 'moqueca-banana',
    name: 'Moqueca de Banana da Terra',
    description: 'Prato brasileiro clássico em versão vegana e cheia de sabor.',
    calories: 320,
    protein: 4,
    prepTime: '45 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1567120690692-660c327631c2?q=80&w=1000&auto=format&fit=crop',
    category: 'lunch',
    rating: 4.8,
    tags: ['vegano', 'sem glúten', 'brasileira', 'almoço'],
    ingredients: [
      '4 bananas da terra maduras em rodelas',
      '1 pimentão vermelho e 1 amarelo em rodelas',
      '2 tomates em rodelas',
      '1 cebola em rodelas',
      '200ml de leite de coco',
      'Azeite de dendê (opcional)',
      'Coentro e sal a gosto'
    ],
    instructions: [
      'Em uma panela de barro ou larga, faça camadas com cebola, pimentões e tomate.',
      'Coloque as bananas por cima.',
      'Adicione o leite de coco e o dendê.',
      'Tampe e cozinhe por 20 minutos sem mexer muito para não desmanchar.',
      'Finalize com coentro fresco.'
    ]
  },
  {
    id: 'pudim-chia',
    name: 'Pudim de Chia com Frutas',
    description: 'Café da manhã ou sobremesa rica em ômega-3.',
    calories: 180,
    protein: 6,
    prepTime: '5 min (+geladeira)',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=1000&auto=format&fit=crop',
    category: 'breakfast',
    rating: 4.5,
    tags: ['vegano', 'sem açúcar', 'fibras', 'café da manhã', 'sem lactose'],
    ingredients: [
      '2 colheres (sopa) de sementes de chia',
      '150ml de leite de coco ou amêndoas',
      'Adoçante ou melado a gosto',
      'Frutas vermelhas ou banana para decorar'
    ],
    instructions: [
      'Misture a chia com o leite vegetal e o adoçante em um copo.',
      'Deixe descansar na geladeira por pelo menos 4 horas (ou durante a noite).',
      'A chia irá formar um gel. Sirva com frutas frescas por cima.'
    ]
  },

  // --- PDF: PROTEICO / FITNESS (Nestlé & Barueri) ---
  {
    id: 'banana-toast',
    name: 'Banana Toast Proteico',
    description: 'Lanche pré ou pós-treino rápido e energético.',
    calories: 280,
    protein: 14,
    prepTime: '10 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1587080413959-06b859fb107d?q=80&w=1000&auto=format&fit=crop',
    category: 'snack',
    rating: 4.6,
    tags: ['proteico', 'vegetariano', 'lanche', 'fácil'],
    ingredients: [
      '1 banana prata madura',
      '2 fatias de pão de forma integral',
      '1 ovo batido',
      '2 colheres (sopa) de Whey Protein ou leite em pó desnatado',
      'Canela em pó a gosto'
    ],
    instructions: [
      'Amasse a banana e misture com o whey/leite em pó.',
      'Recheie o pão com essa mistura.',
      'Passe o sanduíche no ovo batido com canela.',
      'Doure em uma frigideira antiaderente dos dois lados até ficar crocante.'
    ]
  },
  {
    id: 'pao-queijo-batata-doce',
    name: 'Pão de Queijo de Batata Doce',
    description: 'Versão fit do clássico mineiro, com baixo índice glicêmico.',
    calories: 90,
    protein: 3,
    prepTime: '40 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1606851683954-83e5d7506941?q=80&w=1000&auto=format&fit=crop',
    category: 'snack',
    rating: 4.9,
    tags: ['sem glúten', 'lanche', 'brasileira', 'vegetariano'],
    ingredients: [
      '1 xícara de batata doce cozida e amassada',
      '1 xícara de polvilho doce',
      '1/2 xícara de polvilho azedo',
      '1/4 xícara de azeite',
      '1 colher (chá) de sal',
      'Chia a gosto (opcional)'
    ],
    instructions: [
      'Misture todos os ingredientes em uma tigela até formar uma massa homogênea que não grude nas mãos.',
      'Faça bolinhas médias.',
      'Coloque em uma assadeira untada.',
      'Asse em forno pré-aquecido a 180ºC por 25-30 minutos ou até dourar.'
    ]
  },
  {
    id: 'bolinho-frango-proteico',
    name: 'Bolinho Proteico de Frango',
    description: 'Salgado maromba prático para levar.',
    calories: 150,
    protein: 18,
    prepTime: '35 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1608500218858-81e8c9436883?q=80&w=1000&auto=format&fit=crop',
    category: 'snack',
    rating: 4.5,
    tags: ['proteico', 'low-carb', 'lanche', 'sem glúten'],
    ingredients: [
      '250g de peito de frango cozido e desfiado',
      '100g de ricota ou cottage',
      '1 ovo',
      'Farinha de linhaça ou aveia para dar liga',
      'Ervas e sal a gosto'
    ],
    instructions: [
      'Processe o frango com a ricota, ovo e temperos.',
      'Adicione a farinha aos poucos até conseguir modelar bolinhas.',
      'Passe na farinha de linhaça para empanar.',
      'Asse a 200ºC por 20 minutos ou use a Airfryer.'
    ]
  },
  {
    id: 'mocha-refrescante',
    name: 'Mocha Proteico Gelado',
    description: 'Bebida energética com café e proteína.',
    calories: 120,
    protein: 15,
    prepTime: '5 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=1000&auto=format&fit=crop',
    category: 'drink',
    rating: 4.7,
    tags: ['proteico', 'bebida', 'vegetariano', 'pré-treino'],
    ingredients: [
      '200ml de leite desnatado ou vegetal',
      '1 dose de Whey Protein sabor chocolate ou baunilha',
      '1 xícara de café expresso frio',
      'Gelo a gosto'
    ],
    instructions: [
      'Bata todos os ingredientes no liquidificador ou coqueteleira.',
      'Sirva com bastante gelo.'
    ]
  },

  // --- PDF: DOCES FIT / ZERO AÇÚCAR ---
  {
    id: 'mousse-abacate-cacau',
    name: 'Mousse de Chocolate Fit',
    description: 'Cremoso, rico em gorduras boas e sem açúcar refinado.',
    calories: 190,
    protein: 4,
    prepTime: '10 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?q=80&w=1000&auto=format&fit=crop',
    category: 'dessert',
    rating: 4.8,
    tags: ['sem açúcar', 'low-carb', 'vegano', 'doce', 'rápido'],
    ingredients: [
      '1/2 abacate maduro',
      '2 colheres (sopa) de cacau em pó 100%',
      'Adoçante natural (xilitol ou stevia) a gosto',
      'Gotas de essência de baunilha',
      '1 colher (sopa) de leite de coco (opcional)'
    ],
    instructions: [
      'Bata todos os ingredientes no liquidificador ou processador até ficar um creme liso e brilhante.',
      'Leve à geladeira por 30 minutos antes de servir.',
      'Decore com nibs de cacau ou morangos.'
    ]
  },
  {
    id: 'beijinho-colher-fit',
    name: 'Beijinho de Colher Fit',
    description: 'Doce clássico em versão saudável e proteica.',
    calories: 95,
    protein: 5,
    prepTime: '10 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1517651574434-273d65987323?q=80&w=1000&auto=format&fit=crop',
    category: 'dessert',
    rating: 4.3,
    tags: ['sem açúcar', 'vegetariano', 'doce', 'rápido'],
    ingredients: [
      '1 xícara de leite em pó desnatado',
      '1/2 xícara de água quente',
      'Adoçante a gosto (xilitol)',
      '50g de coco ralado sem açúcar'
    ],
    instructions: [
      'No liquidificador, bata o leite em pó, a água quente e o adoçante por 2 minutos.',
      'Misture o coco ralado manualmente.',
      'Leve à geladeira por pelo menos 1 hora para firmar.'
    ]
  },
  {
    id: 'bolo-caneca-coco',
    name: 'Bolo de Coco de Caneca',
    description: 'Pronto em 2 minutos. Perfeito para quando bate a vontade de doce.',
    calories: 180,
    protein: 7,
    prepTime: '5 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=1000&auto=format&fit=crop',
    category: 'snack',
    rating: 4.4,
    tags: ['low-carb', 'sem glúten', 'sem açúcar', 'doce', 'micro-ondas'],
    ingredients: [
      '1 ovo',
      '2 colheres (sopa) de coco ralado',
      '1 colher (sopa) de leite de coco',
      '1 colher (chá) de xilitol',
      '1 colher (café) de fermento'
    ],
    instructions: [
      'Misture tudo em uma caneca, deixando o fermento por último.',
      'Leve ao micro-ondas por 1 minuto e 30 segundos.',
      'Se desejar, faça uma caldinha com leite de coco e whey.'
    ]
  },
  {
    id: 'sorvete-banana-morango',
    name: 'Sorvete Natural de Frutas',
    description: 'Apenas frutas congeladas, nada mais.',
    calories: 110,
    protein: 1,
    prepTime: '5 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?q=80&w=1000&auto=format&fit=crop',
    category: 'dessert',
    rating: 4.9,
    tags: ['vegano', 'sem açúcar', 'sem lactose', 'clean'],
    ingredients: [
      '2 bananas nanicas bem maduras congeladas em rodelas',
      '1 xícara de morangos congelados'
    ],
    instructions: [
      'Retire as frutas do congelador 5 minutos antes de bater.',
      'Processe as frutas no processador ou liquidificador potente até obter consistência cremosa de sorvete.',
      'Não precisa adicionar água ou leite. Sirva imediatamente.'
    ]
  },

  // --- PDF: LANCHES E SALGADOS ---
  {
    id: 'chips-casca-legumes',
    name: 'Chips de Cascas',
    description: 'Zero desperdício e super crocante. Use cascas de batata, cenoura ou mandioquinha.',
    calories: 80,
    protein: 1,
    prepTime: '20 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?q=80&w=1000&auto=format&fit=crop',
    category: 'snack',
    rating: 4.1,
    tags: ['vegano', 'baixa caloria', 'zero desperdício', 'snack'],
    ingredients: [
      'Cascas de batata, cenoura ou mandioquinha (bem lavadas)',
      'Azeite de oliva',
      'Sal e pimenta',
      'Alecrim ou orégano'
    ],
    instructions: [
      'Seque bem as cascas com papel toalha.',
      'Tempere com azeite e as ervas.',
      'Espalhe em uma assadeira sem sobrepor.',
      'Asse em forno médio até ficarem douradas e crocantes (aprox 15 min). Monitore para não queimar.'
    ]
  },
  {
    id: 'pate-atum-cottage',
    name: 'Patê de Atum com Cottage',
    description: 'Rico em proteínas e muito cremoso. Ótimo para sanduíches ou com palitos de cenoura.',
    calories: 120,
    protein: 18,
    prepTime: '5 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1577906096429-f736f9f359f7?q=80&w=1000&auto=format&fit=crop',
    category: 'snack',
    rating: 4.8,
    tags: ['proteico', 'low-carb', 'rápido', 'sem glúten'],
    ingredients: [
      '1 lata de atum sólido em água (escorrido)',
      '2 colheres (sopa) de queijo cottage ou ricota',
      '1 colher (sopa) de cenoura ralada',
      'Salsinha e cebolinha a gosto',
      'Pimenta do reino a gosto'
    ],
    instructions: [
      'Em um bowl, misture o atum com o queijo cottage.',
      'Adicione a cenoura ralada e os temperos.',
      'Misture bem até formar uma pasta.',
      'Sirva com torradas integrais ou palitos de legumes.'
    ]
  },
  {
    id: 'crepioca',
    name: 'Crepioca Clássica',
    description: 'A queridinha do pré-treino. Energia rápida e fácil digestão.',
    calories: 160,
    protein: 7,
    prepTime: '10 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1000&auto=format&fit=crop',
    category: 'breakfast',
    rating: 4.9,
    tags: ['sem glúten', 'café da manhã', 'rápido', 'brasileira'],
    ingredients: [
      '1 ovo',
      '2 colheres (sopa) de goma de tapioca',
      '1 pitada de sal',
      'Recheio a gosto (queijo, frango, tomate)'
    ],
    instructions: [
      'Bata o ovo com a tapioca e o sal com um garfo.',
      'Despeje em uma frigideira antiaderente levemente untada.',
      'Doure dos dois lados.',
      'Adicione o recheio e dobre ao meio.'
    ]
  },
  {
    id: 'caldo-verde-light',
    name: 'Caldo Verde Light',
    description: 'Versão leve usando couve-flor como base para o creme.',
    calories: 150,
    protein: 8,
    prepTime: '30 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1632940668680-436855543955?q=80&w=1000&auto=format&fit=crop',
    category: 'dinner',
    rating: 4.6,
    tags: ['low-carb', 'jantar', 'sopa', 'detox'],
    ingredients: [
      '1/2 couve-flor cozida',
      '1 maço de couve manteiga cortada fina',
      '100g de peito de frango desfiado ou linguiça de frango',
      'Cebola e alho para refogar',
      'Sal e pimenta a gosto'
    ],
    instructions: [
      'Bata a couve-flor cozida no liquidificador com um pouco da água do cozimento até virar um creme.',
      'Refogue a cebola, alho e a proteína escolhida na panela.',
      'Adicione o creme de couve-flor.',
      'Quando ferver, adicione a couve manteiga e deixe cozinhar por 2 minutos.',
      'Acerte o sal e sirva.'
    ]
  },

  // --- LIMPEZA & DETOX (PDF Barueri) ---
  {
    id: 'suco-verde-detox',
    name: 'Suco Verde Detox',
    description: 'Receita da UBS para desintoxicação e energia.',
    calories: 60,
    protein: 1,
    prepTime: '5 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1623689046286-01d812cc8ace?q=80&w=1000&auto=format&fit=crop',
    category: 'drink',
    rating: 4.5,
    tags: ['detox', 'vegano', 'baixa caloria', 'bebida'],
    ingredients: [
      '1 maçã pequena picada',
      '1 folha de couve manteiga (sem o talo grosso)',
      'Suco de 1 limão',
      'Raspas de gengibre',
      '200ml de água gelada'
    ],
    instructions: [
      'Bata todos os ingredientes no liquidificador.',
      'Beba sem coar para aproveitar todas as fibras e benefícios de saciedade.'
    ]
  },
   // --- OUTRAS RECEITAS SAZONAIS / ESPECIAIS ---
  {
    id: 'sorvete-flocos-vegano',
    name: 'Sorvete de Flocos Vegano',
    description: 'Cremoso à base de leite de coco e chocolate amargo.',
    calories: 220,
    protein: 2,
    prepTime: '15 min (+gelo)',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1000&auto=format&fit=crop',
    category: 'dessert',
    rating: 4.8,
    tags: ['vegano', 'sem lactose', 'doce', 'verão'],
    ingredients: [
      '400ml de leite de coco (bem gelado)',
      '3 colheres (sopa) de açúcar demerara ou adoçante',
      '1 colher (chá) de essência de baunilha',
      '50g de chocolate 70% picado'
    ],
    instructions: [
      'Bata o leite de coco com o açúcar e baunilha na batedeira até ficar cremoso.',
      'Misture o chocolate picado delicadamente.',
      'Leve ao freezer por 4 horas, mexendo a cada hora para não cristalizar.'
    ]
  },
  {
    id: 'risoto-shitake',
    name: 'Risoto de Shitake e Limão',
    description: 'Prato sofisticado e leve, perfeito para um jantar especial.',
    calories: 380,
    protein: 10,
    prepTime: '40 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1000&auto=format&fit=crop',
    category: 'dinner',
    rating: 4.7,
    tags: ['vegetariano', 'jantar', 'italiana', 'sem glúten'],
    ingredients: [
      '1 xícara de arroz arbóreo',
      '200g de cogumelos shitake fatiados',
      '1/2 cebola picada',
      '1 taça de vinho branco seco (opcional)',
      'Caldo de legumes caseiro',
      'Raspas de limão siciliano',
      'Queijo parmesão a gosto'
    ],
    instructions: [
      'Refogue a cebola e os cogumelos.',
      'Adicione o arroz e frite levemente. Junte o vinho e deixe evaporar.',
      'Vá adicionando o caldo quente aos poucos, mexendo sempre.',
      'Quando o arroz estiver al dente, desligue, adicione o queijo e as raspas de limão.',
      'Misture bem e sirva imediatamente.'
    ]
  }
];
