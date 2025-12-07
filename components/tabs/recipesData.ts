
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
  // ===========================================================================
  // BEBIDAS & SUCOS
  // ===========================================================================
  {
    id: 'suco-verde-detox',
    name: 'Suco Verde Detox',
    description: 'Bebida rica em fibras e antioxidantes, ideal para começar o dia com energia e limpeza.',
    calories: 65,
    protein: 1,
    prepTime: '5 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    category: 'drink',
    rating: 4.9,
    tags: ['detox', 'vegano', 'low-carb', 'bebida'],
    ingredients: [
      '1 maçã picada com casca',
      '1 folha de couve',
      'Suco de 1 limão',
      '200ml de água',
      'Gengibre a gosto'
    ],
    instructions: [
      'Lave bem os ingredientes.',
      'Bata tudo no liquidificador.',
      'Beba sem coar para aproveitar as fibras.'
    ]
  },
  {
    id: 'suco-rosa-energia',
    name: 'Suco Rosa Energético',
    description: 'Pré-treino natural rico em nitratos que melhoram a oxigenação.',
    calories: 56,
    protein: 1,
    prepTime: '5 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=800&q=80',
    category: 'drink',
    rating: 4.8,
    tags: ['pré-treino', 'vegano', 'sem glúten', 'bebida'],
    ingredients: [
      '1 xícara de água gelada',
      '2 fatias de melancia',
      '1 fatia pequena de beterraba',
      '1 colher de chá de gengibre ralado',
      '1 pitada de canela'
    ],
    instructions: [
      'Bata todos os ingredientes no liquidificador.',
      'Sirva imediatamente com gelo.'
    ]
  },
  {
    id: 'sucha-hibisco',
    name: 'Suchá de Hibisco com Morango',
    description: 'Bebida diurética e refrescante, ótima para retenção de líquidos.',
    calories: 39,
    protein: 1,
    prepTime: '5 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80',
    category: 'drink',
    rating: 4.7,
    tags: ['low-carb', 'diurético', 'zero açúcar', 'bebida'],
    ingredients: [
      '1 xícara de chá de hibisco pronto e gelado',
      '10 morangos',
      'Folhas de hortelã',
      'Gelo'
    ],
    instructions: [
      'Bata o chá de hibisco com os morangos no liquidificador.',
      'Sirva em um copo com gelo e folhas de hortelã.'
    ]
  },
  {
    id: 'mocha-refrescante',
    name: 'Mocha Refrescante Fit',
    description: 'Café gelado proteico para dar energia e saciedade.',
    calories: 120,
    protein: 10,
    prepTime: '5 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b5c7dd9b?auto=format&fit=crop&w=800&q=80',
    category: 'drink',
    rating: 4.9,
    tags: ['proteico', 'café', 'lanche', 'bebida'],
    ingredients: [
      '1/2 xícara de café gelado',
      '1/2 xícara de leite vegetal ou desnatado',
      '1 scoop de whey protein chocolate ou cacau em pó',
      'Gelo a gosto'
    ],
    instructions: [
      'Bata todos os ingredientes no liquidificador ou coqueteleira.',
      'Sirva bem gelado.'
    ]
  },
  {
    id: 'vitamina-proteica-amendoim',
    name: 'Vitamina Proteica de Amendoim',
    description: 'Shake cremoso rico em proteínas e gorduras boas.',
    calories: 280,
    protein: 20,
    prepTime: '5 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1628521360183-20077cd43689?auto=format&fit=crop&w=800&q=80',
    category: 'drink',
    rating: 4.9,
    tags: ['proteico', 'ganho de massa', 'lanche'],
    ingredients: [
      '2 bananas nanicas',
      '2 colheres (sopa) pasta de amendoim',
      '1 dose de whey protein ou proteína vegetal',
      '200ml de leite vegetal',
      'Gelo'
    ],
    instructions: [
      'Bata tudo no liquidificador até ficar cremoso.',
      'Se ficar muito espesso, adicione um pouco de água.'
    ]
  },
  {
    id: 'leite-aveia-caseiro',
    name: 'Leite de Aveia Caseiro',
    description: 'Alternativa vegetal barata e fácil de fazer em casa.',
    calories: 92,
    protein: 3,
    prepTime: '10 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1628424296718-2d1b09228fb4?auto=format&fit=crop&w=800&q=80',
    category: 'drink',
    rating: 4.5,
    tags: ['vegano', 'sem lactose', 'base'],
    ingredients: [
      '2 xícaras de aveia em flocos',
      '4 xícaras de água gelada',
      '1 pitada de sal',
      '1 colher de chá de essência de baunilha (opcional)'
    ],
    instructions: [
      'Deixe a aveia de molho por 1 hora e descarte a água.',
      'Bata a aveia hidratada com a água gelada no liquidificador.',
      'Coe em um pano de prato limpo ou voal.',
      'Conserve na geladeira por até 3 dias.'
    ]
  },

  // ===========================================================================
  // CAFÉ DA MANHÃ & LANCHES
  // ===========================================================================
  {
    id: 'pao-queijo-fit',
    name: 'Pão de Queijo Fit de Frigideira',
    description: 'Versão rápida e saudável do clássico pão de queijo.',
    calories: 135,
    protein: 6,
    prepTime: '10 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1598155523122-3842334d6c10?auto=format&fit=crop&w=800&q=80',
    category: 'breakfast',
    rating: 4.8,
    tags: ['sem glúten', 'rápido', 'café da manhã'],
    ingredients: [
      '1 ovo',
      '2 colheres (sopa) de polvilho (doce ou azedo)',
      '1 colher (sopa) de queijo cottage ou requeijão light',
      '1 pitada de sal'
    ],
    instructions: [
      'Misture todos os ingredientes em uma tigela.',
      'Despeje em uma frigideira antiaderente pequena untada.',
      'Doure dos dois lados.'
    ]
  },
  {
    id: 'pao-queijo-vegano',
    name: 'Pão de Queijo Vegano (Batata)',
    description: 'Delicioso pãozinho de batata doce ou baroa sem ingredientes animais.',
    calories: 120,
    protein: 2,
    prepTime: '40 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1615485925763-8678627d52a7?auto=format&fit=crop&w=800&q=80',
    category: 'snack',
    rating: 4.7,
    tags: ['vegano', 'sem glúten', 'lanche'],
    ingredients: [
      '300g de batata doce ou mandioquinha cozida e amassada',
      '200g de polvilho doce',
      '50g de polvilho azedo',
      '50ml de azeite',
      'Sal e ervas a gosto'
    ],
    instructions: [
      'Misture os polvilhos e o sal.',
      'Acrescente o purê de batata e o azeite.',
      'Amasse até obter uma massa lisa que não gruda nas mãos.',
      'Faça bolinhas e asse a 200ºC por 25-30 minutos.'
    ]
  },
  {
    id: 'crepioca-classica',
    name: 'Crepioca Clássica',
    description: 'Massa versátil de ovo com tapioca, rica em proteínas.',
    calories: 169,
    protein: 6,
    prepTime: '10 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1513442542250-854d436a73f2?auto=format&fit=crop&w=800&q=80',
    category: 'breakfast',
    rating: 4.9,
    tags: ['sem glúten', 'proteico', 'rápido'],
    ingredients: [
      '1 ovo',
      '2 colheres (sopa) de goma de tapioca',
      '1 colher (sopa) de sementes de chia (opcional)',
      'Sal a gosto'
    ],
    instructions: [
      'Bata o ovo com a tapioca e sal.',
      'Despeje na frigideira e doure os dois lados.',
      'Recheie a gosto (queijo, frango, etc).'
    ]
  },
  {
    id: 'banana-toast',
    name: 'Banana Toast Proteico',
    description: 'Lanche doce e proteico, perfeito para pré-treino.',
    calories: 280,
    protein: 14,
    prepTime: '10 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80',
    category: 'snack',
    rating: 4.6,
    tags: ['proteico', 'pré-treino', 'doce'],
    ingredients: [
      '2 fatias de pão integral',
      '1 banana amassada',
      '1 scoop de whey protein ou leite em pó',
      '1 ovo',
      'Canela a gosto'
    ],
    instructions: [
      'Misture a banana com o whey.',
      'Recheie o pão como um sanduíche.',
      'Passe o sanduíche no ovo batido com canela.',
      'Grelhe na frigideira até dourar.'
    ]
  },
  {
    id: 'overnight-oats',
    name: 'Overnight Oats',
    description: 'Café da manhã prático preparado na noite anterior.',
    calories: 250,
    protein: 8,
    prepTime: '5 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80',
    category: 'breakfast',
    rating: 4.8,
    tags: ['vegetariano', 'fibras', 'prático'],
    ingredients: [
      '3 colheres (sopa) de aveia em flocos',
      '100ml de leite (vegetal ou animal)',
      '1 colher (sopa) de iogurte',
      'Frutas picadas e chia a gosto'
    ],
    instructions: [
      'Em um pote, monte camadas: aveia, leite, iogurte e frutas.',
      'Tampe e deixe na geladeira durante a noite.',
      'Consuma na manhã seguinte.'
    ]
  },
  {
    id: 'pao-de-frango',
    name: 'Pão de Frango Low Carb',
    description: 'Pão proteico sem farinha, feito à base de frango.',
    calories: 220,
    protein: 28,
    prepTime: '5 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=800&q=80',
    category: 'snack',
    rating: 4.7,
    tags: ['low-carb', 'proteico', 'sem glúten'],
    ingredients: [
      '100g de peito de frango cozido e desfiado',
      '1 ovo',
      '1 colher (sopa) de requeijão ou queijo ralado',
      '1 colher (café) de fermento em pó'
    ],
    instructions: [
      'Bata tudo no processador ou mixer.',
      'Coloque em um pote quadrado pequeno untado.',
      'Leve ao micro-ondas por 2 a 3 minutos.',
      'Se desejar, toste na sanduicheira depois.'
    ]
  },
  {
    id: 'muffin-fit-banana',
    name: 'Muffin Fit de Banana',
    description: 'Bolinho sem açúcar adoçado apenas com a fruta.',
    calories: 110,
    protein: 3,
    prepTime: '25 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1558303420-f814d8a590f5?auto=format&fit=crop&w=800&q=80',
    category: 'snack',
    rating: 4.5,
    tags: ['sem açúcar', 'lanche', 'kids'],
    ingredients: [
      '2 bananas maduras',
      '2 ovos',
      '1 xícara de aveia em flocos finos',
      '1 colher (chá) de fermento',
      'Canela a gosto'
    ],
    instructions: [
      'Amasse as bananas e misture com os ovos.',
      'Adicione a aveia e o fermento.',
      'Coloque em forminhas e asse a 180ºC por 20 min.'
    ]
  },
  {
    id: 'biscoito-goiabinha-vegan',
    name: 'Biscoito Goiabinha Vegano',
    description: 'Biscoitinho amanteigado vegano com goiabada.',
    calories: 85,
    protein: 1,
    prepTime: '40 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    category: 'snack',
    rating: 4.8,
    tags: ['vegano', 'doce', 'conforto'],
    ingredients: [
      '150g farinha de trigo',
      '75g açúcar',
      '100g gordura de palma ou óleo de coco sólido',
      'Cubinhos de goiabada'
    ],
    instructions: [
      'Misture farinha, açúcar e gordura até formar massa.',
      'Faça bolinhas, afunde o centro e coloque a goiabada.',
      'Asse a 180ºC até dourar levemente.'
    ]
  },
  {
    id: 'granola-caseira-salgada',
    name: 'Granola Salgada Low Carb',
    description: 'Crocante perfeita para saladas e sopas.',
    calories: 92,
    protein: 2,
    prepTime: '15 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=80',
    category: 'snack',
    rating: 4.7,
    tags: ['low-carb', 'vegano', 'crocante'],
    ingredients: [
      'Mix de sementes (girassol, abóbora, gergelim)',
      'Castanhas picadas',
      'Azeite de oliva',
      'Orégano, cúrcuma e sal'
    ],
    instructions: [
      'Misture tudo com azeite e temperos.',
      'Leve à frigideira em fogo baixo mexendo até tostar.',
      'Guarde em pote fechado.'
    ]
  },
  {
    id: 'pao-melado-integral',
    name: 'Pão de Melado Integral',
    description: 'Pão denso e nutritivo, ótimo com café.',
    calories: 180,
    protein: 4,
    prepTime: '50 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    category: 'snack',
    rating: 4.6,
    tags: ['vegano', 'integral', 'café'],
    ingredients: [
      '3 xícaras farinha integral',
      '1 xícara melado de cana',
      'Especiarias (cravo, canela)',
      'Bicarbonato e água morna'
    ],
    instructions: [
      'Misture secos e especiarias.',
      'Dissolva melado na água morna e junte.',
      'Asse em forma untada a 180ºC por 35-40 min.'
    ]
  },

  // ===========================================================================
  // ALMOÇO & JANTAR
  // ===========================================================================
  {
    id: 'lasanha-abobrinha',
    name: 'Lasanha de Abobrinha',
    description: 'Substitui a massa por fatias de abobrinha. Leve e low carb.',
    calories: 250,
    protein: 20,
    prepTime: '40 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=800&q=80',
    category: 'lunch',
    rating: 4.7,
    tags: ['low-carb', 'sem glúten', 'almoço'],
    ingredients: [
      '2 abobrinhas fatiadas no sentido do comprimento',
      '300g de carne moída refogada com molho',
      '200g de queijo muçarela',
      'Queijo parmesão para gratinar'
    ],
    instructions: [
      'Grelhe levemente as fatias de abobrinha.',
      'Em um refratário, alterne camadas de molho, abobrinha e queijo.',
      'Finalize com parmesão e asse até gratinar.'
    ]
  },
  {
    id: 'bife-feijao',
    name: 'Bife de Feijão Vegano',
    description: 'Hambúrguer nutritivo à base de feijão preto.',
    calories: 180,
    protein: 9,
    prepTime: '30 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    category: 'lunch',
    rating: 4.8,
    tags: ['vegano', 'proteico', 'econômico'],
    ingredients: [
      '2 xícaras de feijão preto cozido (sem caldo)',
      '1/2 xícara de farinha de mandioca ou aveia',
      'Cebola, alho e cheiro verde picados',
      'Cominho e páprica a gosto'
    ],
    instructions: [
      'Amasse o feijão grosseiramente.',
      'Misture os temperos e a farinha até dar liga.',
      'Modele em formato de hambúrguer.',
      'Grelhe em frigideira untada até dourar.'
    ]
  },
  {
    id: 'carne-seca-abobora',
    name: 'Carne Seca com Abóbora',
    description: 'Prato nordestino adaptado para low carb.',
    calories: 320,
    protein: 25,
    prepTime: '40 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    category: 'lunch',
    rating: 4.9,
    tags: ['low-carb', 'proteico', 'brasileiro'],
    ingredients: [
      '400g de carne seca dessalgada e cozida',
      '300g de abóbora cabotiá em cubos',
      'Cebola roxa e coentro',
      'Azeite de oliva'
    ],
    instructions: [
      'Refogue a cebola no azeite.',
      'Adicione a carne seca e a abóbora pré-cozida.',
      'Deixe refogar bem e finalize com coentro fresco.'
    ]
  },
  {
    id: 'risoto-couve-flor-shitake',
    name: 'Risoto Fake de Shitake',
    description: 'Falso risoto feito com arroz de couve-flor. Sofisticado e leve.',
    calories: 180,
    protein: 6,
    prepTime: '25 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80',
    category: 'dinner',
    rating: 4.8,
    tags: ['low-carb', 'vegetariano', 'jantar'],
    ingredients: [
      '1 couve-flor triturada (arroz fake)',
      '200g de cogumelos shitake fatiados',
      '1 colher (sopa) de manteiga ou azeite',
      'Queijo parmesão e vinho branco (opcional)'
    ],
    instructions: [
      'Refogue os cogumelos na manteiga.',
      'Adicione a couve-flor triturada e refogue rápido.',
      'Adicione um pouco de água ou vinho e deixe secar.',
      'Finalize com parmesão para dar cremosidade.'
    ]
  },
  {
    id: 'poke-atum',
    name: 'Poke de Atum Funcional',
    description: 'Tigela havaiana refrescante e rica em ômega 3.',
    calories: 350,
    protein: 25,
    prepTime: '15 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    category: 'lunch',
    rating: 4.9,
    tags: ['peixe', 'saudável', 'fresco'],
    ingredients: [
      '150g de atum fresco ou em lata (água)',
      '1/2 xícara de quinoa cozida ou arroz integral',
      'Pepino, cenoura e manga em cubos',
      'Gergelim e shoyu light'
    ],
    instructions: [
      'Monte a base com a quinoa.',
      'Disponha o peixe e os vegetais por cima.',
      'Polvilhe gergelim e tempere com shoyu.'
    ]
  },
  {
    id: 'tofish-nori',
    name: 'Tofish (Peixe de Tofu)',
    description: 'Tofu envolto em alga nori que simula peixe frito.',
    calories: 180,
    protein: 14,
    prepTime: '20 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1582298616131-b7498c56434e?auto=format&fit=crop&w=800&q=80',
    category: 'lunch',
    rating: 4.6,
    tags: ['vegano', 'almoço', 'criativo'],
    ingredients: [
      'Bloco de tofu firme fatiado',
      'Folhas de alga nori',
      'Limão, sal e pimenta',
      'Farinha de milho para empanar'
    ],
    instructions: [
      'Tempere o tofu com limão.',
      'Enrole cada fatia com um pedaço de alga.',
      'Passe na farinha e frite em pouco óleo ou asse.'
    ]
  },
  {
    id: 'moqueca-banana-terra',
    name: 'Moqueca de Banana da Terra',
    description: 'Prato típico brasileiro em versão vegana deliciosa.',
    calories: 320,
    protein: 4,
    prepTime: '40 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1574653853027-5386a372bbab?auto=format&fit=crop&w=800&q=80',
    category: 'lunch',
    rating: 4.9,
    tags: ['vegano', 'brasileiro', 'sem glúten'],
    ingredients: [
      '3 bananas da terra maduras em rodelas',
      '200ml leite de coco',
      'Pimentões coloridos, cebola e tomate',
      'Azeite de dendê e coentro'
    ],
    instructions: [
      'Refogue os vegetais no dendê.',
      'Faça a cama com os vegetais e coloque as bananas.',
      'Adicione o leite de coco e cozinhe até a banana amaciar.',
      'Finalize com coentro.'
    ]
  },
  {
    id: 'macarrao-abobrinha-ovos',
    name: 'Macarrão de Abobrinha Carbonara',
    description: 'Falsos fios de abobrinha com molho cremoso de ovos.',
    calories: 210,
    protein: 12,
    prepTime: '20 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80',
    category: 'dinner',
    rating: 4.7,
    tags: ['low-carb', 'vegetariano', 'rápido'],
    ingredients: [
      '1 abobrinha cortada em espiral ou tiras finas',
      '2 ovos batidos',
      'Queijo parmesão ralado',
      'Alho e azeite'
    ],
    instructions: [
      'Salteie a abobrinha no alho e azeite (al dente).',
      'Desligue o fogo e junte os ovos batidos com queijo.',
      'Mexa rápido para formar o creme sem cozinhar demais os ovos.'
    ]
  },
  {
    id: 'nhoque-moranga',
    name: 'Nhoque de Moranga',
    description: 'Massa leve e colorida, rica em betacaroteno.',
    calories: 240,
    protein: 6,
    prepTime: '50 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    category: 'lunch',
    rating: 4.6,
    tags: ['vegetariano', 'conforto', 'almoço'],
    ingredients: [
      '2 xícaras de purê de moranga (bem seco)',
      '1 xícara de farinha de trigo ou arroz (integral)',
      '1 ovo',
      'Sal e noz moscada'
    ],
    instructions: [
      'Misture o purê com o ovo e temperos.',
      'Adicione farinha aos poucos até dar ponto.',
      'Modele, corte e cozinhe em água fervente.'
    ]
  },
  {
    id: 'torta-legumes-liquidificador',
    name: 'Torta de Legumes de Liquidificador',
    description: 'A clássica torta de vó em versão mais saudável.',
    calories: 200,
    protein: 8,
    prepTime: '45 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1612152605332-7e33389b8654?auto=format&fit=crop&w=800&q=80',
    category: 'dinner',
    rating: 4.5,
    tags: ['vegetariano', 'fácil', 'família'],
    ingredients: [
      'Massa: Ovos, leite, óleo, farinha integral/aveia',
      'Recheio: Seleta de legumes (ervilha, milho, cenoura, brócolis)',
      'Queijo para polvilhar'
    ],
    instructions: [
      'Bata a massa no liquidificador.',
      'Misture os legumes na massa ou coloque no meio.',
      'Asse até dourar.'
    ]
  },
  {
    id: 'falafel-assado',
    name: 'Falafel Assado',
    description: 'Bolinho de grão de bico temperado.',
    calories: 160,
    protein: 7,
    prepTime: '40 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1593001872095-7d5b3868d1b3?auto=format&fit=crop&w=800&q=80',
    category: 'lunch',
    rating: 4.8,
    tags: ['vegano', 'proteico', 'oriente médio'],
    ingredients: [
      '250g grão de bico (demolhado, cru)',
      'Cebola, alho, salsinha, coentro',
      'Cominho, sal, azeite'
    ],
    instructions: [
      'Processe o grão cru com temperos (não virar pasta).',
      'Modele bolinhas ou disquinhos.',
      'Asse ou faça na airfryer até dourar.'
    ]
  },
  {
    id: 'casca-louca-banana',
    name: 'Casca Louca (Carne de Casca)',
    description: 'Recheio incrível feito com cascas de banana desfiadas.',
    calories: 120,
    protein: 2,
    prepTime: '35 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80',
    category: 'dinner',
    rating: 4.4,
    tags: ['vegano', 'sustentável', 'econômico'],
    ingredients: [
      'Cascas de 4 bananas maduras (higienizadas)',
      'Pimentões, cebola, alho',
      'Molho de tomate',
      'Cheiro verde'
    ],
    instructions: [
      'Desfie as cascas com um garfo.',
      'Refogue os temperos, adicione as cascas e o molho.',
      'Cozinhe por 15 min. Use em sanduíches.'
    ]
  },
  {
    id: 'caldo-verde-fit',
    name: 'Caldo Verde Fit (Couve-Flor)',
    description: 'Creme de couve-flor substitui a batata para menos carboidratos.',
    calories: 150,
    protein: 8,
    prepTime: '30 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1547592166-23acbe346499?auto=format&fit=crop&w=800&q=80',
    category: 'dinner',
    rating: 4.7,
    tags: ['low-carb', 'sopa', 'jantar'],
    ingredients: [
      '1 couve-flor cozida',
      '1 maço de couve manteiga fatiada',
      'Linguiça de frango ou tofu defumado em cubos',
      'Alho e cebola'
    ],
    instructions: [
      'Bata a couve-flor cozida com água do cozimento.',
      'Refogue a linguiça/tofu.',
      'Junte o creme e a couve fatiada. Ferva por 5 min.'
    ]
  },
  {
    id: 'risoto-limao',
    name: 'Risoto de Limão Siciliano',
    description: 'Prato aromático e leve, perfeito para jantares especiais.',
    calories: 320,
    protein: 5,
    prepTime: '40 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80',
    category: 'dinner',
    rating: 4.8,
    tags: ['vegetariano', 'gourmet', 'sem glúten'],
    ingredients: [
      '1 xícara arroz arbóreo',
      'Suco e raspas de 1 limão siciliano',
      'Caldo de legumes',
      'Vinho branco (opcional)',
      'Queijo parmesão'
    ],
    instructions: [
      'Refogue o arroz. Adicione vinho e deixe evaporar.',
      'Adicione caldo aos poucos, mexendo sempre.',
      'Finalize com limão, manteiga e queijo.'
    ]
  },
  {
    id: 'salada-fatuche',
    name: 'Salada Fatuche',
    description: 'Salada árabe crocante e refrescante.',
    calories: 180,
    protein: 4,
    prepTime: '15 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1529312266912-b33cf6227e2f?auto=format&fit=crop&w=800&q=80',
    category: 'lunch',
    rating: 4.6,
    tags: ['vegano', 'salada', 'arabe'],
    ingredients: [
      'Pepino, tomate, rabanete, alface',
      'Pão sírio torrado em pedaços',
      'Hortelã e salsinha',
      'Molho: Limão, azeite, zátar ou sumac'
    ],
    instructions: [
      'Pique todos os vegetais.',
      'Misture com as ervas e o pão torrado.',
      'Regue com o molho na hora de servir.'
    ]
  },

  // ===========================================================================
  // SOBREMESAS & DOCES FIT
  // ===========================================================================
  {
    id: 'brownie-feijao',
    name: 'Brownie de Feijão Preto',
    description: 'Surpreendente! A massa fica úmida e densa, sem gosto de feijão.',
    calories: 190,
    protein: 6,
    prepTime: '35 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476d?auto=format&fit=crop&w=800&q=80',
    category: 'dessert',
    rating: 4.8,
    tags: ['sem glúten', 'fibras', 'chocolate'],
    ingredients: [
      '1 e 1/2 xícara de feijão preto cozido (sem tempero)',
      '3 ovos',
      '1/2 xícara de cacau em pó',
      '1/2 xícara de açúcar mascavo ou xilitol',
      '3 colheres (sopa) de óleo de coco'
    ],
    instructions: [
      'Bata todos os ingredientes no liquidificador.',
      'Adicione nozes ou chocolate picado (opcional).',
      'Asse em forma untada a 180ºC por 20-25 min.'
    ]
  },
  {
    id: 'mousse-abacate-cacau',
    name: 'Mousse de Chocolate (Abacate)',
    description: 'Super cremosa, rica em gorduras boas e antioxidantes.',
    calories: 210,
    protein: 3,
    prepTime: '10 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    category: 'dessert',
    rating: 4.9,
    tags: ['vegano', 'sem açúcar', 'low-carb', 'rápido'],
    ingredients: [
      '1 abacate maduro',
      '3 colheres (sopa) de cacau em pó 100%',
      'Adoçante ou mel a gosto',
      'Essência de baunilha (opcional)'
    ],
    instructions: [
      'Bata tudo no processador até ficar um creme liso.',
      'Leve à geladeira por 1 hora antes de servir.'
    ]
  },
  {
    id: 'bolo-milho-frigideira',
    name: 'Bolo de Milho de Frigideira',
    description: 'Café da manhã ou lanche rápido com sabor de fazenda.',
    calories: 180,
    protein: 5,
    prepTime: '10 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
    category: 'breakfast',
    rating: 4.5,
    tags: ['sem glúten', 'rápido', 'conforto'],
    ingredients: [
      '1 ovo',
      '2 colheres (sopa) de milho em lata',
      '2 colheres (sopa) de flocão de milho',
      '1 colher (sopa) de óleo/azeite',
      'Adoçante ou sal (pode ser doce ou salgado)'
    ],
    instructions: [
      'Bata tudo no liquidificador.',
      'Adicione fermento por último.',
      'Asse em frigideira untada em fogo baixo tampado.'
    ]
  },
  {
    id: 'torta-banoffee-fit',
    name: 'Torta Banoffee Fit',
    description: 'Versão saudável da torta inglesa, com doce de leite fit.',
    calories: 240,
    protein: 6,
    prepTime: '40 min',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1619985632461-c3279b01999c?auto=format&fit=crop&w=800&q=80',
    category: 'dessert',
    rating: 4.9,
    tags: ['sem açúcar', 'sobremesa', 'banana'],
    ingredients: [
      'Base: Farelo de aveia + manteiga ou banana',
      'Recheio 1: Doce de leite zero ou leite condensado fit de coco',
      'Recheio 2: Bananas fatiadas',
      'Cobertura: Chantilly zero ou iogurte grego'
    ],
    instructions: [
      'Asse a base por 10 min.',
      'Monte as camadas: doce, banana, cobertura.',
      'Polvilhe cacau ou canela.'
    ]
  },
  {
    id: 'beijinho-fit',
    name: 'Beijinho de Colher Fit',
    description: 'Doce de coco cremoso sem açúcar.',
    calories: 60,
    protein: 3,
    prepTime: '10 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1590080876351-941c33f87293?auto=format&fit=crop&w=800&q=80',
    category: 'snack',
    rating: 4.6,
    tags: ['low-carb', 'sem açúcar', 'rápido'],
    ingredients: [
      '1 xícara de leite em pó desnatado',
      '1/2 xícara de água quente',
      'Adoçante a gosto',
      'Coco ralado sem açúcar'
    ],
    instructions: [
      'Bata leite, água e adoçante no liquidificador.',
      'Misture o coco ralado manualmente.',
      'Deixe gelar para firmar.'
    ]
  },
  {
    id: 'sorvete-banana-morango',
    name: 'Sorvete Natural (Nice Cream)',
    description: 'Apenas frutas congeladas batidas. Cremoso e saudável.',
    calories: 100,
    protein: 1,
    prepTime: '5 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=800&q=80',
    category: 'dessert',
    rating: 4.8,
    tags: ['vegano', 'sem açúcar', 'verão'],
    ingredients: [
      '2 bananas congeladas em rodelas',
      '1 xícara de morangos congelados'
    ],
    instructions: [
      'Processe as frutas congeladas até virar um creme.',
      'Sirva imediatamente ou congele para firmar mais.'
    ]
  },
  {
    id: 'bolo-caneca-chocolate',
    name: 'Bolo de Caneca Low Carb',
    description: 'Mata a vontade de doce em 2 minutos.',
    calories: 140,
    protein: 7,
    prepTime: '3 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1586511938315-d91f50b58100?auto=format&fit=crop&w=800&q=80',
    category: 'snack',
    rating: 4.4,
    tags: ['low-carb', 'sem glúten', 'microondas'],
    ingredients: [
      '1 ovo',
      '1 colher (sopa) de farinha de amêndoas',
      '1 colher (sopa) de cacau em pó',
      '1 colher (sopa) de adoçante e 1 de óleo de coco'
    ],
    instructions: [
      'Misture tudo na caneca.',
      'Micro-ondas por 1:30 a 2 minutos.',
      'Cobertura opcional: quadrado de chocolate 70%.'
    ]
  },
  {
    id: 'pudim-chia',
    name: 'Pudim de Chia',
    description: 'Sobremesa ou café da manhã rico em ômega 3.',
    calories: 160,
    protein: 6,
    prepTime: '5 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=800&q=80',
    category: 'breakfast',
    rating: 4.7,
    tags: ['vegano', 'sem glúten', 'superalimento'],
    ingredients: [
      '2 colheres (sopa) de chia',
      '150ml de leite vegetal (coco ou amêndoa)',
      'Adoçante e baunilha',
      'Frutas para decorar'
    ],
    instructions: [
      'Misture a chia no leite com adoçante.',
      'Deixe na geladeira por pelo menos 4 horas (ideal: noite toda).',
      'Sirva com frutas.'
    ]
  },
  {
    id: 'panna-cotta-diet',
    name: 'Panna Cotta Diet',
    description: 'Sobremesa italiana leve com calda de frutas vermelhas.',
    calories: 120,
    protein: 4,
    prepTime: '4h',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
    category: 'dessert',
    rating: 4.8,
    tags: ['sem açúcar', 'elegante', 'sobremesa'],
    ingredients: [
      '200ml creme de leite light',
      '200ml leite desnatado',
      '1 envelope gelatina incolor',
      'Adoçante e baunilha',
      'Calda de morango diet'
    ],
    instructions: [
      'Hidrate a gelatina.',
      'Aqueça leite e creme com adoçante (não ferver).',
      'Misture gelatina, coloque em taças e gele.',
      'Sirva com a calda.'
    ]
  },
  {
    id: 'torta-maca-integral',
    name: 'Torta de Maçã Integral',
    description: 'Torta rústica com massa crocante e recheio suculento.',
    calories: 220,
    protein: 4,
    prepTime: '1h',
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=800&q=80',
    category: 'dessert',
    rating: 4.7,
    tags: ['integral', 'conforto', 'fruta'],
    ingredients: [
      'Massa: Farinha integral, manteiga, água',
      'Recheio: Maçãs fatiadas, canela, limão, açúcar mascavo'
    ],
    instructions: [
      'Faça a massa e forre a forma.',
      'Misture as maçãs com especiarias e recheie.',
      'Asse até a massa dourar e a maçã amaciar.'
    ]
  },
  {
    id: 'cookie-banana-aveia',
    name: 'Cookie de Banana e Aveia',
    description: 'Apenas 2 ingredientes base. Perfeito para lanche.',
    calories: 60,
    protein: 2,
    prepTime: '20 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1499636138143-bd630f5cf38a?auto=format&fit=crop&w=800&q=80',
    category: 'snack',
    rating: 4.6,
    tags: ['vegano', 'sem açúcar', 'fácil'],
    ingredients: [
      '1 banana madura amassada',
      '1/2 xícara de aveia em flocos',
      'Canela, passas ou gotas de chocolate (opcional)'
    ],
    instructions: [
      'Misture tudo.',
      'Faça montinhos na assadeira.',
      'Asse por 15-20 min a 180ºC.'
    ]
  },
  {
    id: 'prestigio-fit',
    name: 'Prestígio Fit',
    description: 'Bombom de coco coberto com chocolate amargo.',
    calories: 85,
    protein: 1,
    prepTime: '30 min',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1606312619070-d48b706521b0?auto=format&fit=crop&w=800&q=80',
    category: 'dessert',
    rating: 4.9,
    tags: ['low-carb', 'sem açúcar', 'chocolate'],
    ingredients: [
      'Coco ralado sem açúcar',
      'Leite de coco ou creme de leite',
      'Adoçante',
      'Chocolate 70% derretido para cobrir'
    ],
    instructions: [
      'Misture coco, leite e adoçante até modelar.',
      'Faça barrinhas e congele por 20 min.',
      'Banhe no chocolate derretido.'
    ]
  },
  {
    id: 'salame-chocolate-fit',
    name: 'Salame de Chocolate Fit',
    description: 'Doce crocante e chocolatudo, sem culpa.',
    calories: 140,
    protein: 4,
    prepTime: '4h (geladeira)',
    difficulty: 'Fácil',
    image: 'https://images.unsplash.com/photo-1543362906-ac1b482638e3?auto=format&fit=crop&w=800&q=80',
    category: 'dessert',
    rating: 4.7,
    tags: ['sem açúcar', 'crocante', 'festa'],
    ingredients: [
      'Chocolate 70% derretido',
      'Pasta de amendoim',
      'Biscoito maisena integral picado ou castanhas',
      'Adoçante se necessário'
    ],
    instructions: [
      'Misture o chocolate com a pasta.',
      'Adicione os secos picados.',
      'Enrole em filme plástico como salame e gele.'
    ]
  }
];
