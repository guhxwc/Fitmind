import { MEDICATIONS } from '../constants';
import type { MedicationName } from '../types';

const STORAGE_KEY = 'user_custom_doses';

/**
 * Retorna as doses personalizadas salvas no localStorage para uma medicação específica
 */
export function getCustomDoses(medicationName?: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (medicationName && parsed && typeof parsed === 'object') {
      return Array.isArray(parsed[medicationName]) ? parsed[medicationName] : [];
    }
    return [];
  } catch (e) {
    console.error('Erro ao ler custom doses do localStorage:', e);
    return [];
  }
}

/**
 * Salva uma nova dose personalizada para a medicação no localStorage
 * e retorna a lista atualizada de doses customizadas.
 */
export function saveCustomDose(medicationName: string, dose: string): string[] {
  const cleanDose = dose.trim();
  if (!cleanDose) return getCustomDoses(medicationName);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const existing: string[] = Array.isArray(parsed[medicationName]) ? parsed[medicationName] : [];

    if (!existing.includes(cleanDose)) {
      const updated = [...existing, cleanDose];
      parsed[medicationName] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return updated;
    }
    return existing;
  } catch (e) {
    console.error('Erro ao salvar custom dose no localStorage:', e);
    return [];
  }
}

/**
 * Retorna todas as doses disponíveis para uma medicação:
 * Doses padrão do catálogo + doses personalizadas salvas + doses extras passadas (ex: do perfil)
 */
export function getAllDosesForMedication(
  medicationName: MedicationName | string,
  extraCustomDoses: string[] = []
): string[] {
  const med = MEDICATIONS.find(m => m.name === medicationName);
  const baseDoses = med ? [...med.doses] : [];
  const localCustom = getCustomDoses(medicationName);

  const combined = [...baseDoses];

  const toAdd = [...localCustom, ...extraCustomDoses];
  for (const d of toAdd) {
    const trimmed = (d || '').trim();
    if (trimmed && !combined.includes(trimmed)) {
      combined.push(trimmed);
    }
  }

  return combined;
}

/**
 * Normaliza e formata a dose digitada pelo usuário.
 * Se o usuário digitar só números/vírgula/ponto (ex: "0.75" ou "3"), anexa "mg".
 */
export function formatDoseInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^[\d.,]+$/.test(trimmed)) {
    return `${trimmed.replace('.', ',')} mg`;
  }
  return trimmed;
}

