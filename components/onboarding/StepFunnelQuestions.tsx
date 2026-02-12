
import React from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter, OptionButton } from './OnboardingComponents';

interface CommonStepProps {
  onNext: () => void;
  onBack: () => void;
  value: string;
  onSelect: (value: string) => void;
  step: number;
  total: number;
}

// 1. Há quanto tempo você está nessa jornada?
export const StepDuration: React.FC<CommonStepProps> = ({ onNext, onBack, value, onSelect, step, total }) => {
  const options = [
    'Comecei há menos de 1 mês',
    'Entre 1-3 meses',
    'Entre 3-6 meses',
    'Mais de 6 meses'
  ];

  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="Há quanto tempo você está nessa jornada?" 
        subtitle="Para entendermos seu momento atual."
        onBack={onBack}
        step={step}
        totalSteps={total}
      />
      <div className="flex-grow overflow-y-auto hide-scrollbar min-h-0 pb-4">
        {options.map(opt => (
          <OptionButton key={opt} isSelected={value === opt} onClick={() => onSelect(opt)}>
            {opt}
          </OptionButton>
        ))}
      </div>
      <OnboardingFooter onContinue={onNext} disabled={!value} />
    </OnboardingScreen>
  );
};

// 2. Qual é a sua MAIOR frustração com o tratamento até agora?
export const StepFrustration: React.FC<CommonStepProps> = ({ onNext, onBack, value, onSelect, step, total }) => {
  const options = [
    'Os resultados são muito lentos',
    'Os efeitos colaterais são intensos',
    'Não sei se estou fazendo tudo certo',
    'Sinto que estou desperdiçando dinheiro',
    'Medo de ganhar o peso de volta'
  ];

  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="Qual é a sua MAIOR frustração com o tratamento?" 
        subtitle="Queremos resolver seu principal problema."
        onBack={onBack}
        step={step}
        totalSteps={total}
      />
      <div className="flex-grow overflow-y-auto hide-scrollbar min-h-0 pb-4">
        {options.map(opt => (
          <OptionButton key={opt} isSelected={value === opt} onClick={() => onSelect(opt)}>
            {opt}
          </OptionButton>
        ))}
      </div>
      <OnboardingFooter onContinue={onNext} disabled={!value} />
    </OnboardingScreen>
  );
};

// 3. O que mais te preocupa sobre o futuro?
export const StepFutureWorry: React.FC<CommonStepProps> = ({ onNext, onBack, value, onSelect, step, total }) => {
  const options = [
    'Ganhar o peso de volta',
    'Não manter a longo prazo',
    'Dependência do remédio',
    'Gastar muito sem garantia'
  ];

  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="O que mais te preocupa sobre o futuro?" 
        subtitle="Vamos te dar segurança nessa caminhada."
        onBack={onBack}
        step={step}
        totalSteps={total}
      />
      <div className="flex-grow overflow-y-auto hide-scrollbar min-h-0 pb-4">
        {options.map(opt => (
          <OptionButton key={opt} isSelected={value === opt} onClick={() => onSelect(opt)}>
            {opt}
          </OptionButton>
        ))}
      </div>
      <OnboardingFooter onContinue={onNext} disabled={!value} />
    </OnboardingScreen>
  );
};

// 4. Se você pudesse ter UMA coisa garantida nessa jornada, qual seria?
export const StepOneThing: React.FC<CommonStepProps> = ({ onNext, onBack, value, onSelect, step, total }) => {
  const options = [
    'Resultados 2-3x mais rápidos',
    'Controle total dos efeitos colaterais',
    'Certeza de estar fazendo certo',
    'Garantia de não voltar a engordar'
  ];

  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="Se pudesse ter UMA coisa garantida, qual seria?" 
        subtitle="Focaremos nossos esforços nisso."
        onBack={onBack}
        step={step}
        totalSteps={total}
      />
      <div className="flex-grow overflow-y-auto hide-scrollbar min-h-0 pb-4">
        {options.map(opt => (
          <OptionButton key={opt} isSelected={value === opt} onClick={() => onSelect(opt)}>
            {opt}
          </OptionButton>
        ))}
      </div>
      <OnboardingFooter onContinue={onNext} disabled={!value} />
    </OnboardingScreen>
  );
};

// 5. Como você quer se sentir daqui a 3 meses?
export const StepDreamOutcome: React.FC<CommonStepProps> = ({ onNext, onBack, value, onSelect, step, total }) => {
  const options = [
    'Confiante e orgulhoso(a)',
    'Livre da ansiedade',
    'No controle da minha saúde',
    'Inspirado(a) e motivado(a)'
  ];

  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="Como você quer se sentir daqui a 3 meses?" 
        subtitle="Visualize seu sucesso."
        onBack={onBack}
        step={step}
        totalSteps={total}
      />
      <div className="flex-grow overflow-y-auto hide-scrollbar min-h-0 pb-4">
        {options.map(opt => (
          <OptionButton key={opt} isSelected={value === opt} onClick={() => onSelect(opt)}>
            {opt}
          </OptionButton>
        ))}
      </div>
      <OnboardingFooter onContinue={onNext} disabled={!value} />
    </OnboardingScreen>
  );
};

// 6. Quanto você está investindo por mês no seu tratamento?
export const StepInvestment: React.FC<CommonStepProps> = ({ onNext, onBack, value, onSelect, step, total }) => {
  const options = [
    'Menos de R$ 500',
    'Entre R$ 500 - R$ 1.000',
    'Entre R$ 1.000 - R$ 2.000',
    'Mais de R$ 2.000'
  ];

  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title="Qual seu investimento mensal (remédio + outros)?" 
        subtitle="Para garantirmos que seu investimento valha a pena."
        onBack={onBack}
        step={step}
        totalSteps={total}
      />
      <div className="flex-grow overflow-y-auto hide-scrollbar min-h-0 pb-4">
        {options.map(opt => (
          <OptionButton key={opt} isSelected={value === opt} onClick={() => onSelect(opt)}>
            {opt}
          </OptionButton>
        ))}
      </div>
      <OnboardingFooter onContinue={onNext} disabled={!value} />
    </OnboardingScreen>
  );
};
