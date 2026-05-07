import { supabase } from '../supabaseClient';

/** WhatsApp default do Allan caso o banco não retorne nada (último recurso) */
const FALLBACK_NUTRI_WHATSAPP = '5543999142672';

/**
 * Normaliza um número de WhatsApp:
 * - Remove tudo que não for dígito.
 * - Se vier com 10 ou 11 dígitos (BR sem DDI), prefixa '55'.
 * - Se vier curto demais, retorna null.
 */
export function normalizeWhatsappNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10 || digits.length === 11) {
    digits = '55' + digits; // assume Brasil
  }
  if (digits.length < 11) return null; // muito curto pra ser válido
  return digits;
}

/** Cache simples na sessão pra evitar buscar o mesmo nutri várias vezes */
let cachedNutriWhatsapp: { id: string; whatsapp: string | null } | null = null;

/**
 * Busca o WhatsApp do nutri do paciente atual.
 * Estratégia:
 * 1. Pega a consultation ativa do user e pega o nutritionist_id dela.
 * 2. Lê nutritionists.whatsapp.
 * 3. Se não tiver, usa fallback (Allan).
 */
export async function getNutriWhatsappForUser(userId: string): Promise<string> {
  try {
    // 1. Consultation ativa (não cancelada) mais recente do paciente
    const { data: consultation } = await supabase
      .from('consultations')
      .select('nutritionist_id')
      .eq('user_id', userId)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nutriId = consultation?.nutritionist_id;
    if (!nutriId) {
      return FALLBACK_NUTRI_WHATSAPP;
    }

    // 2. Cache hit?
    const cache = cachedNutriWhatsapp;
    if (cache && cache.id === nutriId && cache.whatsapp) {
      return cache.whatsapp;
    }

    // 3. Busca whatsapp na tabela nutritionists
    const { data: nutri } = await supabase
      .from('nutritionists')
      .select('whatsapp')
      .eq('id', nutriId)
      .maybeSingle();

    const normalized = normalizeWhatsappNumber(nutri?.whatsapp) || FALLBACK_NUTRI_WHATSAPP;
    cachedNutriWhatsapp = { id: nutriId, whatsapp: normalized };
    return normalized;
  } catch (err) {
    console.warn('[whatsappService] erro ao buscar nutri whatsapp:', err);
    return FALLBACK_NUTRI_WHATSAPP;
  }
}

/**
 * Abre uma conversa do WhatsApp em nova aba.
 * Se userId for fornecido, busca o WhatsApp do nutri do paciente; senão usa fallback (Allan).
 */
export async function openNutriWhatsApp(opts: {
  userId?: string | null;
  message: string;
}): Promise<void> {
  const { userId, message } = opts;
  let phone = FALLBACK_NUTRI_WHATSAPP;
  if (userId) {
    phone = await getNutriWhatsappForUser(userId);
  }
  const text = encodeURIComponent(message);
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
}
