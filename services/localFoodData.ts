
export interface LocalFoodItem {
  id: number;
  nome: string;
  categoria: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras: number;
  porcao_gramas: number;
}

// Dados baseados na Tabela TACO (Tabela Brasileira de Composição de Alimentos)
export const LOCAL_FOOD_DATABASE: LocalFoodItem[] = [
  // Cereais e Derivados
  { id: 1, nome: "Arroz, integral, cozido", categoria: "Cereais e derivados", calorias: 124, proteinas: 2.6, carboidratos: 25.8, gorduras: 1.0, fibras: 2.7, porcao_gramas: 100 },
  { id: 3, nome: "Arroz, tipo 1, cozido", categoria: "Cereais e derivados", calorias: 128, proteinas: 2.5, carboidratos: 28.1, gorduras: 0.2, fibras: 1.6, porcao_gramas: 100 },
  { id: 7, nome: "Aveia, flocos, crua", categoria: "Cereais e derivados", calorias: 394, proteinas: 13.9, carboidratos: 66.6, gorduras: 8.5, fibras: 9.1, porcao_gramas: 100 },
  { id: 13, nome: "Biscoito, salgado, cream cracker", categoria: "Cereais e derivados", calorias: 432, proteinas: 10.1, carboidratos: 68.7, gorduras: 14.4, fibras: 2.5, porcao_gramas: 100 },
  { id: 35, nome: "Farinha, de trigo", categoria: "Cereais e derivados", calorias: 360, proteinas: 9.8, carboidratos: 75.1, gorduras: 1.4, fibras: 2.3, porcao_gramas: 100 },
  { id: 41, nome: "Macarrão, trigo, cru, com ovos", categoria: "Cereais e derivados", calorias: 371, proteinas: 10.3, carboidratos: 76.6, gorduras: 2.0, fibras: 2.3, porcao_gramas: 100 },
  { id: 48, nome: "Pão, aveia, forma", categoria: "Cereais e derivados", calorias: 343, proteinas: 12.4, carboidratos: 59.6, gorduras: 5.7, fibras: 6.0, porcao_gramas: 100 },
  { id: 50, nome: "Pão, glúten, forma", categoria: "Cereais e derivados", calorias: 253, proteinas: 12.0, carboidratos: 44.1, gorduras: 2.7, fibras: 2.5, porcao_gramas: 100 },
  { id: 52, nome: "Pão, trigo, forma, integral", categoria: "Cereais e derivados", calorias: 253, proteinas: 9.4, carboidratos: 49.9, gorduras: 3.7, fibras: 6.9, porcao_gramas: 100 },
  { id: 53, nome: "Pão, trigo, francês", categoria: "Cereais e derivados", calorias: 300, proteinas: 8.0, carboidratos: 58.6, gorduras: 3.1, fibras: 2.3, porcao_gramas: 100 },
  { id: 61, nome: "Pipoca, com óleo de soja, sem sal", categoria: "Cereais e derivados", calorias: 448, proteinas: 9.9, carboidratos: 70.3, gorduras: 15.9, fibras: 14.3, porcao_gramas: 100 },

  // Verduras, Hortaliças e Derivados
  { id: 64, nome: "Abóbora, cabotian, cozida", categoria: "Verduras, hortaliças e derivados", calorias: 48, proteinas: 1.4, carboidratos: 10.8, gorduras: 0.7, fibras: 2.5, porcao_gramas: 100 },
  { id: 70, nome: "Abobrinha, italiana, cozida", categoria: "Verduras, hortaliças e derivados", calorias: 15, proteinas: 1.1, carboidratos: 3.0, gorduras: 0.2, fibras: 1.6, porcao_gramas: 100 },
  { id: 80, nome: "Alface, roxa, crua", categoria: "Verduras, hortaliças e derivados", calorias: 13, proteinas: 0.9, carboidratos: 2.5, gorduras: 0.2, fibras: 2.0, porcao_gramas: 100 },
  { id: 93, nome: "Batata, inglesa, frita", categoria: "Verduras, hortaliças e derivados", calorias: 267, proteinas: 5.0, carboidratos: 35.6, gorduras: 13.1, fibras: 8.1, porcao_gramas: 100 },
  { id: 94, nome: "Batata, inglesa, sauté", categoria: "Verduras, hortaliças e derivados", calorias: 68, proteinas: 1.3, carboidratos: 14.1, gorduras: 0.9, fibras: 1.4, porcao_gramas: 100 },
  { id: 100, nome: "Brócolis, cozido", categoria: "Verduras, hortaliças e derivados", calorias: 25, proteinas: 2.1, carboidratos: 4.4, gorduras: 0.5, fibras: 3.4, porcao_gramas: 100 },
  { id: 101, nome: "Brócolis, cru", categoria: "Verduras, hortaliças e derivados", calorias: 25, proteinas: 3.6, carboidratos: 4.0, gorduras: 0.3, fibras: 2.9, porcao_gramas: 100 },
  { id: 109, nome: "Cenoura, cozida", categoria: "Verduras, hortaliças e derivados", calorias: 30, proteinas: 0.8, carboidratos: 6.7, gorduras: 0.2, fibras: 2.6, porcao_gramas: 100 },
  { id: 115, nome: "Couve, manteiga, crua", categoria: "Verduras, hortaliças e derivados", calorias: 27, proteinas: 2.9, carboidratos: 4.3, gorduras: 0.5, fibras: 3.1, porcao_gramas: 100 },
  { id: 116, nome: "Couve, manteiga, refogada", categoria: "Verduras, hortaliças e derivados", calorias: 90, proteinas: 1.7, carboidratos: 8.7, gorduras: 6.6, fibras: 5.7, porcao_gramas: 100 },
  { id: 118, nome: "Couve-flor, cozida", categoria: "Verduras, hortaliças e derivados", calorias: 19, proteinas: 1.2, carboidratos: 3.9, gorduras: 0.3, fibras: 2.1, porcao_gramas: 100 },
  { id: 129, nome: "Mandioca, cozida", categoria: "Verduras, hortaliças e derivados", calorias: 125, proteinas: 0.6, carboidratos: 30.1, gorduras: 0.3, fibras: 1.6, porcao_gramas: 100 },
  { id: 159, nome: "Tomate, molho industrializado", categoria: "Verduras, hortaliças e derivados", calorias: 38, proteinas: 1.4, carboidratos: 7.7, gorduras: 0.9, fibras: 3.1, porcao_gramas: 100 },

  // Frutas e derivados
  { id: 163, nome: "Abacate, cru", categoria: "Frutas e derivados", calorias: 96, proteinas: 1.2, carboidratos: 6.0, gorduras: 8.4, fibras: 6.3, porcao_gramas: 100 },
  { id: 167, nome: "Açaí, polpa, com xarope de guaraná e glucose", categoria: "Frutas e derivados", calorias: 110, proteinas: 0.7, carboidratos: 21.5, gorduras: 3.7, fibras: 1.7, porcao_gramas: 100 },
  { id: 176, nome: "Banana, doce em barra", categoria: "Frutas e derivados", calorias: 280, proteinas: 2.2, carboidratos: 75.7, gorduras: 0.1, fibras: 3.8, porcao_gramas: 100 }, 
  { id: 207, nome: "Kiwi, cru", categoria: "Frutas e derivados", calorias: 51, proteinas: 1.3, carboidratos: 11.5, gorduras: 0.6, fibras: 2.7, porcao_gramas: 100 },
  { id: 221, nome: "Maçã, Argentina, com casca, crua", categoria: "Frutas e derivados", calorias: 63, proteinas: 0.2, carboidratos: 16.6, gorduras: 0.2, fibras: 2.0, porcao_gramas: 100 },
  { id: 228, nome: "Manga, Haden, crua", categoria: "Frutas e derivados", calorias: 64, proteinas: 0.4, carboidratos: 16.7, gorduras: 0.3, fibras: 1.6, porcao_gramas: 100 },
  { id: 232, nome: "Maracujá, cru", categoria: "Frutas e derivados", calorias: 68, proteinas: 2.0, carboidratos: 12.3, gorduras: 2.1, fibras: 1.1, porcao_gramas: 100 },
  { id: 242, nome: "Pêra, Park, crua", categoria: "Frutas e derivados", calorias: 53, proteinas: 0.6, carboidratos: 14.0, gorduras: 0.2, fibras: 3.0, porcao_gramas: 100 },
  
  // Gorduras e óleos
  { id: 260, nome: "Azeite, de oliva, extra virgem", categoria: "Gorduras e óleos", calorias: 884, proteinas: 0.0, carboidratos: 0.0, gorduras: 100.0, fibras: 0.0, porcao_gramas: 100 },
  { id: 261, nome: "Manteiga, com sal", categoria: "Gorduras e óleos", calorias: 726, proteinas: 0.4, carboidratos: 0.1, gorduras: 82.4, fibras: 0.0, porcao_gramas: 100 },
  
  // Pescados e frutos do mar
  { id: 277, nome: "Atum, conserva em óleo", categoria: "Pescados e frutos do mar", calorias: 166, proteinas: 26.2, carboidratos: 0.0, gorduras: 6.0, fibras: 0.0, porcao_gramas: 100 },
  { id: 315, nome: "Salmão, filé, com pele, fresco, grelhado", categoria: "Pescados e frutos do mar", calorias: 229, proteinas: 23.9, carboidratos: 0.0, gorduras: 14.0, fibras: 0.0, porcao_gramas: 100 },
  { id: 317, nome: "Salmão, sem pele, fresco, grelhado", categoria: "Pescados e frutos do mar", calorias: 243, proteinas: 26.1, carboidratos: 0.0, gorduras: 14.5, fibras: 0.0, porcao_gramas: 100 },
  { id: 320, nome: "Sardinha, frita", categoria: "Pescados e frutos do mar", calorias: 257, proteinas: 33.4, carboidratos: 0.0, gorduras: 12.7, fibras: 0.0, porcao_gramas: 100 },
  
  // Carnes e derivados
  { id: 326, nome: "Carne, bovina, acém, moído, cozido", categoria: "Carnes e derivados", calorias: 212, proteinas: 26.7, carboidratos: 0.0, gorduras: 10.9, fibras: 0.0, porcao_gramas: 100 },
  { id: 342, nome: "Carne, bovina, contra-filé de costela, grelhado", categoria: "Carnes e derivados", calorias: 275, proteinas: 29.9, carboidratos: 0.0, gorduras: 16.3, fibras: 0.0, porcao_gramas: 100 },
  { id: 357, nome: "Carne, bovina, filé mingnon, sem gordura, cru", categoria: "Carnes e derivados", calorias: 143, proteinas: 21.6, carboidratos: 0.0, gorduras: 5.6, fibras: 0.0, porcao_gramas: 100 },
  { id: 358, nome: "Carne, bovina, filé mingnon, sem gordura, grelhado", categoria: "Carnes e derivados", calorias: 220, proteinas: 32.8, carboidratos: 0.0, gorduras: 8.8, fibras: 0.0, porcao_gramas: 100 },
  { id: 377, nome: "Carne, bovina, patinho, sem gordura, grelhado", categoria: "Carnes e derivados", calorias: 219, proteinas: 35.9, carboidratos: 0.0, gorduras: 7.3, fibras: 0.0, porcao_gramas: 100 },
  { id: 386, nome: "Coxinha de frango, frita", categoria: "Carnes e derivados", calorias: 283, proteinas: 9.6, carboidratos: 34.5, gorduras: 11.8, fibras: 5.0, porcao_gramas: 100 },
  { id: 392, nome: "Frango, caipira, inteiro, com pele, cozido", categoria: "Carnes e derivados", calorias: 243, proteinas: 23.9, carboidratos: 0.0, gorduras: 15.6, fibras: 0.0, porcao_gramas: 100 },
  { id: 404, nome: "Frango, inteiro, sem pele, cozido", categoria: "Carnes e derivados", calorias: 170, proteinas: 25.0, carboidratos: 0.0, gorduras: 7.1, fibras: 0.0, porcao_gramas: 100 },
  { id: 410, nome: "Frango, peito, sem pele, grelhado", categoria: "Carnes e derivados", calorias: 159, proteinas: 32.0, carboidratos: 0.0, gorduras: 2.5, fibras: 0.0, porcao_gramas: 100 },
  { id: 415, nome: "Hambúrguer, bovino, cru", categoria: "Carnes e derivados", calorias: 215, proteinas: 13.2, carboidratos: 4.2, gorduras: 16.2, fibras: 0.0, porcao_gramas: 100 },
  { id: 417, nome: "Hambúrguer, bovino, grelhado", categoria: "Carnes e derivados", calorias: 210, proteinas: 13.2, carboidratos: 11.3, gorduras: 12.4, fibras: 0.0, porcao_gramas: 100 },
  
  // Leite e derivados
  { id: 448, nome: "Iogurte, natural", categoria: "Leite e derivados", calorias: 51, proteinas: 4.1, carboidratos: 1.9, gorduras: 3.0, fibras: 0.0, porcao_gramas: 100 },
  { id: 453, nome: "Leite, condensado", categoria: "Leite e derivados", calorias: 313, proteinas: 7.7, carboidratos: 57.0, gorduras: 6.7, fibras: 0.0, porcao_gramas: 100 },
  { id: 459, nome: "Leite, de vaca, integral, pó", categoria: "Leite e derivados", calorias: 497, proteinas: 25.4, carboidratos: 39.2, gorduras: 26.9, fibras: 0.0, porcao_gramas: 100 },
  { id: 461, nome: "Queijo, minas, frescal", categoria: "Leite e derivados", calorias: 264, proteinas: 17.4, carboidratos: 3.2, gorduras: 20.2, fibras: 0.0, porcao_gramas: 100 },
  { id: 463, nome: "Queijo, mozarela", categoria: "Leite e derivados", calorias: 330, proteinas: 22.6, carboidratos: 3.0, gorduras: 25.2, fibras: 0.0, porcao_gramas: 100 },
  { id: 464, nome: "Queijo, parmesão", categoria: "Leite e derivados", calorias: 453, proteinas: 35.6, carboidratos: 1.7, gorduras: 33.5, fibras: 0.0, porcao_gramas: 100 },
  { id: 467, nome: "Queijo, prato", categoria: "Leite e derivados", calorias: 360, proteinas: 22.7, carboidratos: 1.9, gorduras: 29.1, fibras: 0.0, porcao_gramas: 100 },
  
  // Ovos e derivados
  { id: 484, nome: "Omelete, de queijo", categoria: "Ovos e derivados", calorias: 268, proteinas: 15.6, carboidratos: 0.4, gorduras: 22.0, fibras: 0.0, porcao_gramas: 100 },
  { id: 488, nome: "Ovo, de galinha, inteiro, cozido", categoria: "Ovos e derivados", calorias: 146, proteinas: 13.3, carboidratos: 0.6, gorduras: 9.5, fibras: 0.0, porcao_gramas: 100 },
  { id: 490, nome: "Ovo, de galinha, inteiro, frito", categoria: "Ovos e derivados", calorias: 240, proteinas: 15.6, carboidratos: 1.2, gorduras: 18.6, fibras: 0.0, porcao_gramas: 100 },
  
  // Leguminosas e derivados
  { id: 557, nome: "Amendoim, grão, cru", categoria: "Leguminosas e derivados", calorias: 544, proteinas: 27.2, carboidratos: 20.3, gorduras: 43.9, fibras: 8.0, porcao_gramas: 100 },
  { id: 561, nome: "Feijão, carioca, cozido", categoria: "Leguminosas e derivados", calorias: 76, proteinas: 4.8, carboidratos: 13.6, gorduras: 0.5, fibras: 8.5, porcao_gramas: 100 },
  { id: 567, nome: "Feijão, preto, cozido", categoria: "Leguminosas e derivados", calorias: 77, proteinas: 4.5, carboidratos: 14.0, gorduras: 0.5, fibras: 8.4, porcao_gramas: 100 },
  { id: 575, nome: "Grão-de-bico, cru", categoria: "Leguminosas e derivados", calorias: 355, proteinas: 21.2, carboidratos: 57.9, gorduras: 5.4, fibras: 12.4, porcao_gramas: 100 },
  { id: 577, nome: "Lentilha, cozida", categoria: "Leguminosas e derivados", calorias: 93, proteinas: 6.3, carboidratos: 16.3, gorduras: 0.5, fibras: 7.9, porcao_gramas: 100 },
  
  // Nozes e sementes
  { id: 588, nome: "Castanha-de-caju, torrada, salgada", categoria: "Nozes e sementes", calorias: 570, proteinas: 18.5, carboidratos: 29.1, gorduras: 46.3, fibras: 3.7, porcao_gramas: 100 },
  { id: 589, nome: "Castanha-do-Brasil, crua", categoria: "Nozes e sementes", calorias: 643, proteinas: 14.5, carboidratos: 15.1, gorduras: 63.5, fibras: 7.9, porcao_gramas: 100 },
  { id: 597, nome: "Noz, crua", categoria: "Nozes e sementes", calorias: 620, proteinas: 14.0, carboidratos: 18.4, gorduras: 59.4, fibras: 7.2, porcao_gramas: 100 },
];
