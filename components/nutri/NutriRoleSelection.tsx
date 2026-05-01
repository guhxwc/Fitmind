import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const FITMIND_LOGO_URL =
  'https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/Icon%20Fitmind/logo%20painel.png';

const SUPPORT_EMAIL = 'suporte@fitmind.com.br';

// Ícones inline (SVG) — leves, sem dependência extra além do que já existe.
const PatientIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-7 h-7"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" />
  </svg>
);

const NutriIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-7 h-7"
    aria-hidden="true"
  >
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <path d="M3 13h18" />
  </svg>
);

const ArrowRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const QuestionMark = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7" />
    <line x1="12" y1="17" x2="12" y2="17.01" />
  </svg>
);

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  delay?: number;
  testId?: string;
}

const RoleCard: React.FC<RoleCardProps> = ({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
  delay = 0,
  testId,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="
        group relative flex flex-col items-center text-center
        bg-white dark:bg-[#1C1C1E]
        border border-gray-100 dark:border-gray-800
        rounded-2xl
        p-7 sm:p-8
        shadow-sm hover:shadow-[0_8px_30px_rgba(0,122,255,0.08)]
        transition-all duration-300
        hover:-translate-y-0.5
      "
    >
      {/* Ícone em círculo azul claro */}
      <div
        className="
          flex items-center justify-center
          w-16 h-16 mb-5
          rounded-full
          bg-blue-50 dark:bg-blue-500/10
          text-[#007AFF] dark:text-blue-400
          transition-transform duration-300
          group-hover:scale-105
        "
      >
        {icon}
      </div>

      <h2 className="text-[19px] sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">
        {title}
      </h2>

      <p className="text-[14.5px] leading-relaxed text-gray-500 dark:text-gray-400 mb-6 max-w-[260px]">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        data-testid={testId}
        className="
          w-full
          flex items-center justify-center gap-2
          bg-[#007AFF] hover:bg-[#0066d6]
          active:bg-[#0058bb]
          text-white font-medium text-[15px]
          px-5 py-3.5 rounded-xl
          transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1C1C1E]
          shadow-sm
        "
      >
        <span>{buttonLabel}</span>
        <ArrowRight />
      </button>
    </motion.div>
  );
};

interface NutriRoleSelectionProps {
  /**
   * Chamado quando o usuário escolhe entrar como paciente.
   * Deve liberar o fluxo principal (MainApp) para o usuário.
   */
  onSelectPatient: () => void;
}

/**
 * Tela de seleção de papel exibida APÓS o login,
 * quando o usuário também é nutricionista.
 *
 * Permite ao profissional escolher entre acessar
 * a área de paciente ou o painel do nutricionista.
 */
export const NutriRoleSelection: React.FC<NutriRoleSelectionProps> = ({ onSelectPatient }) => {
  const navigate = useNavigate();

  const handleSelectPatient = () => {
    try {
      sessionStorage.setItem('nutri_role_choice', 'patient');
    } catch (_) {
      /* sessionStorage indisponível — segue o fluxo */
    }
    onSelectPatient();
  };

  const handleSelectNutri = () => {
    try {
      sessionStorage.setItem('nutri_role_choice', 'nutri');
    } catch (_) {
      /* sessionStorage indisponível — segue o fluxo */
    }
    navigate('/painel-nutri');
  };

  const handleSupport = () => {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      'Preciso de ajuda — FitMind'
    )}`;
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('nutri_role_choice');
    } catch (_) { /* ignore */ }
    await supabase.auth.signOut();
  };

  return (
    <div
      className="
        relative min-h-screen w-full
        flex flex-col items-center justify-center
        px-5 sm:px-8 py-10
        bg-gradient-to-br from-white via-[#f7faff] to-[#eaf2ff]
        dark:from-black dark:via-[#0a0f1a] dark:to-[#0d1626]
        overflow-hidden
      "
    >
      {/* Ondas decorativas (SVG) — referência ao mock */}
      <svg
        className="pointer-events-none absolute -left-24 top-0 h-[110%] w-[55%] opacity-50 dark:opacity-20"
        viewBox="0 0 600 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <path
            key={`l-${i}`}
            d={`M -50 ${100 + i * 55} Q 150 ${20 + i * 55}, 320 ${
              140 + i * 55
            } T 700 ${120 + i * 55}`}
            stroke="#007AFF"
            strokeOpacity={0.08 + i * 0.005}
            strokeWidth={1}
            fill="none"
          />
        ))}
      </svg>

      <svg
        className="pointer-events-none absolute -right-24 bottom-0 h-[110%] w-[55%] opacity-50 dark:opacity-20 rotate-180"
        viewBox="0 0 600 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <path
            key={`r-${i}`}
            d={`M -50 ${100 + i * 55} Q 150 ${20 + i * 55}, 320 ${
              140 + i * 55
            } T 700 ${120 + i * 55}`}
            stroke="#007AFF"
            strokeOpacity={0.08 + i * 0.005}
            strokeWidth={1}
            fill="none"
          />
        ))}
      </svg>

      {/* Botão de sair (canto sup. direito) — útil caso o usuário tenha entrado em outra conta */}
      <button
        type="button"
        onClick={handleLogout}
        className="
          absolute top-5 right-5 sm:top-6 sm:right-7
          text-[13px] font-medium
          text-gray-400 hover:text-gray-600
          dark:text-gray-500 dark:hover:text-gray-300
          transition-colors duration-200
          z-10
        "
      >
        Sair
      </button>

      {/* Conteúdo principal */}
      <div className="relative z-[1] w-full max-w-[920px] flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-6 sm:mb-8"
        >
          <img
            src={FITMIND_LOGO_URL}
            alt="FitMind"
            className="h-12 sm:h-16 md:h-20 w-auto object-contain select-none"
            draggable={false}
            onError={(e) => {
              // Fallback amigável caso o asset não carregue
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </motion.div>

        {/* Título e subtítulo */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-9 sm:mb-12 px-2"
        >
          <h1 className="text-[26px] sm:text-[32px] font-bold text-gray-900 dark:text-white tracking-tight">
            Bem-vindo ao FitMind
          </h1>
          <p className="mt-2 text-[15px] sm:text-[16px] text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
            Escolha como deseja acessar sua conta para continuar.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-[760px]">
          <RoleCard
            icon={<PatientIcon />}
            title="Entrar como paciente"
            description="Acesse sua área, acompanhe seus planos e evolua com o FitMind."
            buttonLabel="Entrar como paciente"
            onClick={handleSelectPatient}
            delay={0.18}
            testId="nutri-role-patient"
          />
          <RoleCard
            icon={<NutriIcon />}
            title="Entrar como nutricionista"
            description="Acesse sua área profissional e gerencie seus pacientes com praticidade."
            buttonLabel="Entrar como nutricionista"
            onClick={handleSelectNutri}
            delay={0.28}
            testId="nutri-role-nutri"
          />
        </div>

        {/* Rodapé — suporte */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 sm:mt-14 flex items-center justify-center gap-2 text-[14px] text-gray-500 dark:text-gray-400"
        >
          <span className="text-gray-400 dark:text-gray-500"><QuestionMark /></span>
          <span>Precisa de ajuda?</span>
          <button
            type="button"
            onClick={handleSupport}
            className="text-[#007AFF] hover:text-[#0066d6] font-medium transition-colors duration-200 focus:outline-none focus-visible:underline"
          >Fale com o suporte</button>
        </motion.div>
      </div>
    </div>
  );
};

export default NutriRoleSelection;
