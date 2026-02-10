
import type { Medication, UserData } from './types';

export const MEDICATIONS: Medication[] = [
  { name: 'Mounjaro', doses: ['2,5 mg', '5 mg', '7,5 mg', '10 mg', '12,5 mg', '15 mg'] },
  { name: 'Ozempic', doses: ['0,25 mg', '0,5 mg', '1 mg', '2 mg'] },
  { name: 'Wegovy', doses: ['0,25 mg', '0,5 mg', '1 mg', '1,7 mg', '2,4 mg'] },
  { name: 'Saxenda', doses: ['0,6 mg', '1,2 mg', '1,8 mg', '2,4 mg', '3 mg'] },
  { name: 'Other', doses: ['Dose única'] },
];

export const WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export const DEFAULT_USER_DATA: Omit<UserData, 'id'> = {
  name: '',
  gender: 'Prefiro não dizer',
  age: 25,
  height: 170,
  weight: 80,
  startWeight: 80,
  targetWeight: 70,
  activityLevel: 'Sedentário',
  glpStatus: 'using',
  applicationFrequency: 'Semanalmente',
  pace: 0.5,
  motivation: [],
  medication: {
    name: 'Ozempic',
    dose: '0,5 mg',
    nextApplication: 'Domingo',
  },
  goals: {
    water: 2.8,
    protein: 120,
    calories: 1800,
  },
  streak: 0,
  lastActivityDate: null,
};
