
import type { Exercise } from './types';

export const EXERCISE_DATABASE: Exercise[] = [
  // --- PEITO (CHEST) ---
  { id: 101, name: "Supino Reto com Barra", muscleGroups: ["Peito", "Ombros", "Tríceps"], equipment: "Barra", level: "Intermediário", setting: "Academia" },
  { id: 102, name: "Supino Inclinado com Halteres", muscleGroups: ["Peito", "Ombros"], equipment: "Halteres", level: "Intermediário", setting: "Academia" },
  { id: 103, name: "Supino Reto com Halteres", muscleGroups: ["Peito", "Tríceps"], equipment: "Halteres", level: "Intermediário", setting: "Academia" },
  { id: 104, name: "Crucifixo Reto (Halteres)", muscleGroups: ["Peito"], equipment: "Halteres", level: "Intermediário", setting: "Academia" },
  { id: 105, name: "Crucifixo Inclinado (Halteres)", muscleGroups: ["Peito"], equipment: "Halteres", level: "Intermediário", setting: "Academia" },
  { id: 106, name: "Peck Deck (Voador)", muscleGroups: ["Peito"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 107, name: "Crossover Polia Alta", muscleGroups: ["Peito"], equipment: "Cabo", level: "Avançado", setting: "Academia" },
  { id: 108, name: "Crossover Polia Baixa", muscleGroups: ["Peito"], equipment: "Cabo", level: "Avançado", setting: "Academia" },
  { id: 109, name: "Flexão de Braço", muscleGroups: ["Peito", "Tríceps"], equipment: "Corpo", level: "Iniciante", setting: "Casa" },
  { id: 110, name: "Flexão Inclinada (Apoio)", muscleGroups: ["Peito"], equipment: "Corpo", level: "Iniciante", setting: "Casa" },
  { id: 111, name: "Supino Máquina Sentado", muscleGroups: ["Peito", "Tríceps"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 112, name: "Pullover com Halter", muscleGroups: ["Peito", "Dorsal"], equipment: "Halteres", level: "Intermediário", setting: "Academia" },

  // --- COSTAS (BACK) ---
  { id: 201, name: "Puxada Frontal (Pulley)", muscleGroups: ["Costas", "Bíceps"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 202, name: "Puxada Triângulo (Fechada)", muscleGroups: ["Costas"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 203, name: "Remada Baixa (Cabo)", muscleGroups: ["Costas"], equipment: "Cabo", level: "Intermediário", setting: "Academia" },
  { id: 204, name: "Remada Curvada com Barra", muscleGroups: ["Costas", "Lombar"], equipment: "Barra", level: "Avançado", setting: "Academia" },
  { id: 205, name: "Remada Unilateral (Serrote)", muscleGroups: ["Costas", "Bíceps"], equipment: "Halteres", level: "Intermediário", setting: "Academia" },
  { id: 206, name: "Remada Máquina (Articulada)", muscleGroups: ["Costas"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 207, name: "Barra Fixa (Pull-up)", muscleGroups: ["Costas", "Bíceps"], equipment: "Barra Fixa", level: "Avançado", setting: "Academia" },
  { id: 208, name: "Graviton (Barra Assistida)", muscleGroups: ["Costas"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 209, name: "Levantamento Terra", muscleGroups: ["Costas", "Pernas", "Lombar"], equipment: "Barra", level: "Avançado", setting: "Academia" },
  { id: 210, name: "Extensão Lombar (Banco)", muscleGroups: ["Lombar"], equipment: "Banco", level: "Iniciante", setting: "Academia" },
  { id: 211, name: "Pulldown (Cabo)", muscleGroups: ["Costas"], equipment: "Cabo", level: "Intermediário", setting: "Academia" },
  { id: 212, name: "Remada Cavalinho", muscleGroups: ["Costas"], equipment: "Barra", level: "Avançado", setting: "Academia" },

  // --- PERNAS: QUADRÍCEPS (QUADS) ---
  { id: 301, name: "Agachamento Livre com Barra", muscleGroups: ["Pernas", "Glúteos"], equipment: "Barra", level: "Avançado", setting: "Academia" },
  { id: 302, name: "Leg Press 45", muscleGroups: ["Pernas"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 303, name: "Cadeira Extensora", muscleGroups: ["Pernas"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 304, name: "Agachamento Hack", muscleGroups: ["Pernas"], equipment: "Máquina", level: "Intermediário", setting: "Academia" },
  { id: 305, name: "Agachamento Smith", muscleGroups: ["Pernas"], equipment: "Máquina", level: "Intermediário", setting: "Academia" },
  { id: 306, name: "Agachamento Búlgaro", muscleGroups: ["Pernas", "Glúteos"], equipment: "Halteres", level: "Avançado", setting: "Academia" },
  { id: 307, name: "Passada (Avanço)", muscleGroups: ["Pernas", "Glúteos"], equipment: "Halteres", level: "Intermediário", setting: "Academia" },
  { id: 308, name: "Agachamento Goblet", muscleGroups: ["Pernas"], equipment: "Halteres", level: "Iniciante", setting: "Academia" },
  { id: 309, name: "Agachamento Frontal", muscleGroups: ["Pernas"], equipment: "Barra", level: "Avançado", setting: "Academia" },

  // --- PERNAS: POSTERIOR & GLÚTEOS (HAMSTRINGS/GLUTES) ---
  { id: 351, name: "Mesa Flexora", muscleGroups: ["Pernas"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 352, name: "Cadeira Flexora", muscleGroups: ["Pernas"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 353, name: "Stiff com Barra", muscleGroups: ["Pernas", "Glúteos"], equipment: "Barra", level: "Intermediário", setting: "Academia" },
  { id: 354, name: "Stiff com Halteres", muscleGroups: ["Pernas", "Glúteos"], equipment: "Halteres", level: "Iniciante", setting: "Academia" },
  { id: 355, name: "Elevação Pélvica (Barra)", muscleGroups: ["Glúteos"], equipment: "Barra", level: "Intermediário", setting: "Academia" },
  { id: 356, name: "Elevação Pélvica Máquina", muscleGroups: ["Glúteos"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 357, name: "Cadeira Abdutora", muscleGroups: ["Glúteos"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 358, name: "Glúteo no Cabo (Coice)", muscleGroups: ["Glúteos"], equipment: "Cabo", level: "Intermediário", setting: "Academia" },
  { id: 359, name: "Panturrilha Sentado", muscleGroups: ["Panturrilha"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 360, name: "Panturrilha em Pé (Smith)", muscleGroups: ["Panturrilha"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },

  // --- OMBROS (SHOULDERS) ---
  { id: 401, name: "Desenvolvimento com Halteres", muscleGroups: ["Ombros"], equipment: "Halteres", level: "Intermediário", setting: "Academia" },
  { id: 402, name: "Desenvolvimento Militar (Barra)", muscleGroups: ["Ombros"], equipment: "Barra", level: "Avançado", setting: "Academia" },
  { id: 403, name: "Desenvolvimento Máquina", muscleGroups: ["Ombros"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 404, name: "Elevação Lateral Halteres", muscleGroups: ["Ombros"], equipment: "Halteres", level: "Iniciante", setting: "Academia" },
  { id: 405, name: "Elevação Lateral Cabo", muscleGroups: ["Ombros"], equipment: "Cabo", level: "Intermediário", setting: "Academia" },
  { id: 406, name: "Elevação Frontal", muscleGroups: ["Ombros"], equipment: "Halteres", level: "Iniciante", setting: "Academia" },
  { id: 407, name: "Crucifixo Inverso (Posterior)", muscleGroups: ["Ombros", "Costas"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 408, name: "Remada Alta", muscleGroups: ["Ombros", "Trapézio"], equipment: "Barra", level: "Intermediário", setting: "Academia" },
  { id: 409, name: "Encolhimento de Ombros", muscleGroups: ["Trapézio"], equipment: "Halteres", level: "Iniciante", setting: "Academia" },

  // --- BÍCEPS & TRÍCEPS (ARMS) ---
  { id: 501, name: "Rosca Direta (Barra)", muscleGroups: ["Bíceps"], equipment: "Barra", level: "Iniciante", setting: "Academia" },
  { id: 502, name: "Rosca Alternada", muscleGroups: ["Bíceps"], equipment: "Halteres", level: "Iniciante", setting: "Academia" },
  { id: 503, name: "Rosca Martelo", muscleGroups: ["Bíceps", "Antebraço"], equipment: "Halteres", level: "Iniciante", setting: "Academia" },
  { id: 504, name: "Rosca Scott (Máquina)", muscleGroups: ["Bíceps"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 505, name: "Rosca Concentrada", muscleGroups: ["Bíceps"], equipment: "Halteres", level: "Intermediário", setting: "Academia" },
  { id: 506, name: "Tríceps Pulley (Corda)", muscleGroups: ["Tríceps"], equipment: "Cabo", level: "Iniciante", setting: "Academia" },
  { id: 507, name: "Tríceps Pulley (Barra)", muscleGroups: ["Tríceps"], equipment: "Cabo", level: "Iniciante", setting: "Academia" },
  { id: 508, name: "Tríceps Testa", muscleGroups: ["Tríceps"], equipment: "Barra", level: "Intermediário", setting: "Academia" },
  { id: 509, name: "Tríceps Francês", muscleGroups: ["Tríceps"], equipment: "Halteres", level: "Intermediário", setting: "Academia" },
  { id: 510, name: "Mergulho no Banco", muscleGroups: ["Tríceps"], equipment: "Banco", level: "Iniciante", setting: "Casa" },
  { id: 511, name: "Paralelas", muscleGroups: ["Tríceps", "Peito"], equipment: "Barras Paralelas", level: "Avançado", setting: "Academia" },

  // --- ABDÔMEN (ABS) ---
  { id: 601, name: "Abdominal Supra (Chão)", muscleGroups: ["Abdômen"], equipment: "Corpo", level: "Iniciante", setting: "Casa" },
  { id: 602, name: "Abdominal Infra (Elevação de Pernas)", muscleGroups: ["Abdômen"], equipment: "Corpo", level: "Intermediário", setting: "Casa" },
  { id: 603, name: "Prancha Isométrica", muscleGroups: ["Abdômen"], equipment: "Corpo", level: "Iniciante", setting: "Casa" },
  { id: 604, name: "Abdominal na Máquina", muscleGroups: ["Abdômen"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 605, name: "Abdominal na Polia (Crunch)", muscleGroups: ["Abdômen"], equipment: "Cabo", level: "Intermediário", setting: "Academia" },
  { id: 606, name: "Abdominal Bicicleta", muscleGroups: ["Abdômen"], equipment: "Corpo", level: "Intermediário", setting: "Casa" },
  { id: 607, name: "Roda Abdominal", muscleGroups: ["Abdômen"], equipment: "Acessório", level: "Avançado", setting: "Academia" },

  // --- CARDIO ---
  { id: 701, name: "Esteira (Caminhada Inclinada)", muscleGroups: ["Cardio", "Pernas"], equipment: "Esteira", level: "Iniciante", setting: "Academia" },
  { id: 702, name: "Esteira (Corrida)", muscleGroups: ["Cardio"], equipment: "Esteira", level: "Intermediário", setting: "Academia" },
  { id: 703, name: "Elíptico", muscleGroups: ["Cardio"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 704, name: "Bicicleta Ergométrica", muscleGroups: ["Cardio", "Pernas"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 705, name: "Escada (Simulador)", muscleGroups: ["Cardio", "Pernas"], equipment: "Máquina", level: "Avançado", setting: "Academia" },
  { id: 706, name: "Remo Indoor", muscleGroups: ["Cardio", "Costas"], equipment: "Máquina", level: "Avançado", setting: "Academia" },
  { id: 707, name: "Pular Corda", muscleGroups: ["Cardio"], equipment: "Corda", level: "Intermediário", setting: "Casa" },
  { id: 708, name: "Polichinelos", muscleGroups: ["Cardio"], equipment: "Corpo", level: "Iniciante", setting: "Casa" },
  { id: 709, name: "Burpees", muscleGroups: ["Cardio", "Corpo Todo"], equipment: "Corpo", level: "Avançado", setting: "Casa" },
];
