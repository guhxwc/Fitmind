import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ebook.css';
import { useEbookFontsAndMeta } from './useEbookFontsAndMeta';

export const EbookThankYouPage: React.FC = () => {
  const navigate = useNavigate();

  useEbookFontsAndMeta({
    title: 'Pronto! Seu ebook foi enviado | FitMind',
    noindex: true
  });

  return (
    <div className="fm-ebook">
      <header className="top">
        <div className="wrap">
          <img
            src="/logo-fitmind.webp"
            alt="FitMind"
            width="93"
            height="34"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          />
          <span>FitMind Health</span>
        </div>
      </header>

      <main className="wrap">
        <div className="thank-wrap">
          <div className="thank-check">✓</div>
          <h1>Pronto! Seu ebook foi enviado para o seu e-mail</h1>
          <p>
            O acesso ao <strong>Prato Cheio de Proteína</strong> já foi disparado. Em poucos minutos você receberá o link para download e visualização.
          </p>

          <div className="thank-box">
            <b>Importante:</b> Caso não encontre a mensagem na sua caixa de entrada principal em até 10 minutos, verifique as abas de <b>Promoções</b>, <b>Spam</b> ou <b>Lixo Eletrônico</b>.
          </div>

          <button
            className="btn btn-ghost"
            style={{ width: '100%' }}
            onClick={() => navigate('/')}
          >
            Conhecer o app FitMind
          </button>
        </div>
      </main>

      <footer style={{ marginTop: 'auto' }}>
        <div className="wrap">
          <span>© FitMind Health · fitmindhealth.com.br</span>
          <span>Suporte: contato@fitmindhealth.com.br</span>
        </div>
      </footer>
    </div>
  );
};

export default EbookThankYouPage;
