
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, DocumentIcon } from '../core/Icons';

export const TermsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-black font-sans animate-fade-in flex flex-col">
            <div className="sticky top-0 z-20 bg-[#F2F2F7]/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800">
                <div className="px-4 h-14 flex items-center justify-between max-w-md mx-auto">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-blue-500 hover:text-blue-600 font-medium text-[17px] flex items-center gap-1">
                        <ChevronLeftIcon className="w-5 h-5" />
                        Voltar
                    </button>
                    <h1 className="font-semibold text-[17px] text-gray-900 dark:text-white">Termos de Uso</h1>
                    <div className="w-16"></div>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto px-5 py-6 max-w-md mx-auto pb-24 text-gray-800 dark:text-gray-300 text-[15px] leading-relaxed">
                
                {/* Resumo (TL;DR) - Card Minimalista */}
                <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-6 shadow-sm mb-8 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
                            <DocumentIcon className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            Resumo dos Pontos Principais
                        </h3>
                    </div>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <li className="flex gap-3 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mt-2 flex-shrink-0"></span>
                            <span><strong>IA Experimental:</strong> O FitMind usa Inteligência Artificial para estimativas. Sempre verifique os dados.</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mt-2 flex-shrink-0"></span>
                            <span><strong>Pagamentos:</strong> Assinaturas renovam automaticamente. Cancele 24h antes para evitar cobrança.</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mt-2 flex-shrink-0"></span>
                            <span><strong>Uso Pessoal:</strong> O app é uma ferramenta de acompanhamento, não um tratamento médico.</span>
                        </li>
                    </ul>
                </div>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">1. O Serviço</h2>
                        <p className="text-gray-500 dark:text-gray-400">O FitMind é uma plataforma SaaS (Software as a Service) projetada para auxiliar no acompanhamento de hábitos saudáveis, ingestão calórica e monitoramento de peso, especificamente otimizada para usuários de tratamentos GLP-1.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">2. Uso de Inteligência Artificial</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-2">Funcionalidades como "CalorieCam", "Personal Trainer IA" e "Chat" utilizam modelos de linguagem e visão computacional (como Google Gemini).</p>
                        <p className="text-gray-500 dark:text-gray-400"><strong>Limitações:</strong> A IA pode gerar informações imprecisas ("alucinações"). As contagens de calorias e macros são estimativas aproximadas. Você concorda em não utilizar estas informações para decisões críticas de saúde ou dosagem de medicamentos.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">3. Assinatura e Pagamentos</h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-500 dark:text-gray-400 marker:text-gray-300">
                            <li><strong>Cobrança:</strong> Processada via Stripe. A FitMind não armazena dados completos do seu cartão.</li>
                            <li><strong>Renovação Automática:</strong> Sua assinatura será renovada automaticamente (mensal ou anualmente) a menos que cancelada nas configurações pelo menos 24 horas antes do fim do período atual.</li>
                            <li><strong>Reembolso:</strong> Garantimos o direito de arrependimento de 7 dias após a primeira compra, conforme legislação local (Brasil).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">4. Propriedade Intelectual</h2>
                        <p className="text-gray-500 dark:text-gray-400">Todo o design, código-fonte, textos, gráficos e funcionalidades são de propriedade exclusiva da FitMind Health Technologies. É concedida a você uma licença limitada, revogável e não exclusiva para uso pessoal do aplicativo.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">5. Cancelamento e Suspensão</h2>
                        <p className="text-gray-500 dark:text-gray-400">Podemos suspender ou encerrar sua conta se houver violação destes termos, uso fraudulento ou comportamento abusivo na plataforma. Você pode encerrar sua conta a qualquer momento através do menu "Ajustes".</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">6. Foro e Legislação</h2>
                        <p className="text-gray-500 dark:text-gray-400">Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer dúvidas decorrentes deste contrato.</p>
                    </section>

                    <hr className="border-gray-200 dark:border-gray-800" />

                    {/* ISENÇÃO MÉDICA - Discreta no final */}
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Isenção de Responsabilidade</h2>
                        <div className="text-xs text-gray-400 dark:text-gray-600 space-y-2 leading-relaxed text-justify">
                            <p>O CONTEÚDO DESTE APLICATIVO TEM CARÁTER MERAMENTE INFORMATIVO E EDUCACIONAL. A FITMIND NÃO É UMA CLÍNICA MÉDICA E NÃO FORNECE ACONSELHAMENTO, DIAGNÓSTICO OU TRATAMENTO MÉDICO.</p>
                            <p>O uso de medicamentos como Ozempic, Mounjaro, Wegovy, Saxenda e similares deve ser estritamente orientado e prescrito por um médico qualificado. Nenhuma funcionalidade do aplicativo (incluindo lembretes de dose ou gráficos de nível estimado) substitui a orientação profissional. Nunca altere sua medicação ou ignore conselhos médicos com base em informações lidas no FitMind. Em caso de emergência médica, contate o serviço de saúde imediatamente.</p>
                        </div>
                    </section>

                    <div className="pt-8 text-center text-xs text-gray-300 dark:text-gray-700">
                        <p>FitMind Health Technologies</p>
                        <p>CNPJ: 00.000.000/0001-00</p>
                        <p>support@fitmind.app</p>
                        <p className="mt-2">Última atualização: Fevereiro de 2024</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
