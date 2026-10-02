import React, { useState } from 'react';
import { ebookTrack, secondsSinceCheckoutStarted } from './ebookTracking';

// Mini-pesquisa de 1 toque para quem volta do Stripe sem pagar: "o que te fez parar?".
// É a única forma de saber o MOTIVO de quem chegou até a tela de pagamento.
const OPTIONS: Array<{ id: string; label: string }> = [
  { id: 'prefer_card', label: 'Prefiro pagar com cartão' },
  { id: 'pix_problem', label: 'Não consegui pagar o Pix' },
  { id: 'no_money', label: 'Sem dinheiro agora' },
  { id: 'think_more', label: 'Quero pensar mais' },
  { id: 'price', label: 'O preço não me convenceu' },
  { id: 'technical', label: 'Deu erro ou travou' },
  { id: 'other', label: 'Outro motivo' },
];

export const EbookCancelPoll: React.FC = () => {
  const [state, setState] = useState<'open' | 'thanks' | 'closed'>('open');

  if (state === 'closed') return null;

  const pick = (id: string, label: string) => {
    ebookTrack('ebook_cancel_reason', { reason: id, label, seconds_on_stripe: secondsSinceCheckoutStarted() });
    setState('thanks');
    setTimeout(() => setState('closed'), 2500);
  };

  const box: React.CSSProperties = {
    position: 'fixed',
    left: 12,
    right: 12,
    bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
    zIndex: 95,
    maxWidth: 560,
    margin: '0 auto',
    background: '#ffffff',
    borderRadius: 18,
    padding: '16px 16px 14px',
    boxShadow: '0 18px 40px -16px rgba(26,69,114,.45)',
    border: '1px solid #D5DEEB',
    fontFamily: 'inherit',
    color: '#161717',
  };

  if (state === 'thanks') {
    return <div style={{ ...box, textAlign: 'center', fontWeight: 600 }} role="status">Obrigado! Isso nos ajuda a melhorar. 💙</div>;
  }

  return (
    <div style={box} role="group" aria-label="O que te fez parar?">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1A4572' }}>O que te fez parar no pagamento?</p>
        <button
          aria-label="Fechar"
          onClick={() => { ebookTrack('ebook_cancel_poll_dismiss'); setState('closed'); }}
          style={{ background: 'none', border: 0, fontSize: 20, lineHeight: 1, cursor: 'pointer', color: '#5B6878', padding: 0 }}
        >×</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => pick(o.id, o.label)}
            style={{ border: '1.5px solid #D5DEEB', background: '#F1F4FB', borderRadius: 999, padding: '8px 12px', fontSize: 13.5, fontWeight: 600, color: '#1A4572', cursor: 'pointer' }}
          >{o.label}</button>
        ))}
      </div>
    </div>
  );
};
