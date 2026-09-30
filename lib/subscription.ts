// Helpers de exibição do status da assinatura PRO.
import type { UserData } from '../types';

export function isCancelScheduled(userData?: Pick<UserData, 'isPro' | 'subscriptionStatus'> | null): boolean {
  return !!userData?.isPro && userData?.subscriptionStatus === 'cancel_at_period_end';
}

export function formatProValidUntil(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
