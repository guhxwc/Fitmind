
import type { Exercise } from './types';

export const EXERCISE_DATABASE: Exercise[] = [
  // Peito
  { id: 1, name: "Supino Reto com Barra", muscleGroups: ["Peito", "Ombros", "Tríceps"], equipment: "Barra", level: "Intermediário", setting: "Academia" },
  { id: 2, name: "Supino Inclinado com Halteres", muscleGroups: ["Peito", "Ombros"], equipment: "Halteres", level: "Intermediário", setting: "Academia" },
  { id: 3, name: "Flexão de Braço", muscleGroups: ["Peito", "Ombros", "Tríceps"], equipment: "Corpo", level: "Iniciante", setting: "Casa" },
  { id: 4, name: "Crucifixo na Máquina (Voador)", muscleGroups: ["Peito"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 5, name: "Flexão Inclinada", muscleGroups: ["Peito", "Ombros"], equipment: "Corpo", level: "Iniciante", setting: "Casa" },

  // Costas
  { id: 10, name: "Puxada Frontal (Pulley)", muscleGroups: ["Costas", "Bíceps"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 11, name: "Remada Curvada com Barra", muscleGroups: ["Costas", "Bíceps"], equipment: "Barra", level: "Avançado", setting: "Academia" },
  { id: 12, name: "Remada Unilateral com Halter (Serrote)", muscleGroups: ["Costas", "Bíceps"], equipment: "Halteres", level: "Intermediário", setting: "Academia" },
  { id: 13, name: "Barra Fixa", muscleGroups: ["Costas", "Bíceps"], equipment: "Barra Fixa", level: "Avançado", setting: "Academia" },
  { id: 14, name: "Remada Baixa", muscleGroups: ["Costas"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 15, name: "Superman", muscleGroups: ["Costas"], equipment: "Corpo", level: "Iniciante", setting: "Casa" },

  // Pernas e Glúteos
  { id: 20, name: "Agachamento Livre com Barra", muscleGroups: ["Pernas", "Glúteos"], equipment: "Barra", level: "Avançado", setting: "Academia" },
  { id: 21, name: "Leg Press 45", muscleGroups: ["Pernas", "Glúteos"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 22, name: "Afundo com Halteres", muscleGroups: ["Pernas", "Glúteos"], equipment: "Halteres", level: "Intermediário", setting: "Academia" },
  { id: 23, name: "Cadeira Extensora", muscleGroups: ["Pernas"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 24, name: "Mesa Flexora", muscleGroups: ["Pernas"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 25, name: "Elevação Pélvica", muscleGroups: ["Glúteos", "Pernas"], equipment: "Barra", level: "Intermediário", setting: "Academia" },
  { id: 26, name: "Agachamento com Peso do Corpo", muscleGroups: ["Pernas", "Glúteos"], equipment: "Corpo", level: "Iniciante", setting: "Casa" },
  { id: 27, name: "Agachamento Búlgaro", muscleGroups: ["Pernas", "Glúteos"], equipment: "Halteres", level: "Avançado", setting: "Academia" },
  { id: 28, name: "Stiff com Barra", muscleGroups: ["Pernas", "Glúteos"], equipment: "Barra", level: "Avançado", setting: "Academia" },
  { id: 29, name: "Elevação de Panturrilha", muscleGroups: ["Pernas"], equipment: "Corpo", level: "Iniciante", setting: "Casa" },
  
  // Braços (Bíceps e Tríceps)
  { id: 30, name: "Rosca Direta com Barra", muscleGroups: ["Braços"], equipment: "Barra", level: "Intermediário", setting: "Academia" },
  { id: 31, name: "Rosca Alternada com Halteres", muscleGroups: ["Braços"], equipment: "Halteres", level: "Iniciante", setting: "Academia" },
  { id: 32, name: "Tríceps Pulley com Corda", muscleGroups: ["Braços"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
  { id: 33, name: "Tríceps Testa com Barra", muscleGroups: ["Braços"], equipment: "Barra", level: "Avançado", setting: "Academia" },
  { id: 34, name: "Mergulho no Banco", muscleGroups: ["Braços", "Peito"], equipment: "Corpo", level: "Intermediário", setting: "Casa" },

  // Ombros
  { id: 40, name: "Desenvolvimento Militar com Barra", muscleGroups: ["Ombros"], equipment: "Barra", level: "Avançado", setting: "Academia" },
  { id: 41, name: "Elevação Lateral com Halteres", muscleGroups: ["Ombros"], equipment: "Halteres", level: "Iniciante", setting: "Academia" },
  { id: 42, name: "Elevação Frontal com Halteres", muscleGroups: ["Ombros"], equipment: "Halteres", level: "Iniciante", setting: "Academia" },
  
  // Abdômen
  { id: 50, name: "Prancha Abdominal", muscleGroups: ["Abdômen"], equipment: "Corpo", level: "Iniciante", setting: "Casa" },
  { id: 51, name: "Abdominal Supra", muscleGroups: ["Abdômen"], equipment: "Corpo", level: "Iniciante", setting: "Casa" },
  { id: 52, name: "Elevação de Pernas", muscleGroups: ["Abdômen"], equipment: "Corpo", level: "Intermediário", setting: "Casa" },
  { id: 53, name: "Abdominal na Máquina", muscleGroups: ["Abdômen"], equipment: "Máquina", level: "Iniciante", setting: "Academia" },
];
