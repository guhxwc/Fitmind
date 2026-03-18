
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
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                            <span><strong>IA Experimental:</strong> O FitMind usa IA (Google Gemini) para estimativas. Sempre verifique os dados; eles podem ser imprecisos.</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                            <span><strong>Pagamentos:</strong> Assinaturas renovam automaticamente. Cancele 24h antes para evitar cobrança. Direito de arrependimento de 7 dias.</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                            <span><strong>Não é Médico:</strong> O app é uma ferramenta de acompanhamento, não substitui orientação ou prescrição médica profissional.</span>
                        </li>
                    </ul>
                </div>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">1. Aceite dos Termos</h2>
                        <p className="text-gray-500 dark:text-gray-400">Ao criar uma conta, acessar ou utilizar o aplicativo FitMind ("App"), você ("Usuário") declara que leu, compreendeu e concorda integralmente com estes Termos de Uso ("Termos"). Caso não concorde com qualquer disposição, não utilize o App.</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">O FitMind é operado por FitMind Health Technologies, inscrita no CNPJ 65.458.597/0001-68, com sede no Brasil.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">2. Descrição do Serviço</h2>
                        <p className="text-gray-500 dark:text-gray-400">O FitMind é uma plataforma SaaS (Software as a Service) projetada para auxiliar usuários no acompanhamento de hábitos alimentares, registro de refeições, monitoramento de peso, treinos e metas diárias de saúde, com funcionalidades otimizadas para usuários de tratamentos com GLP-1 (Ozempic, Mounjaro, Wegovy, Saxenda e similares).</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">O App está disponível como Progressive Web App (PWA) acessível via navegador web em dispositivos móveis e desktop.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">3. Elegibilidade</h2>
                        <ul className="list-disc pl-5 space-y-1 text-gray-500 dark:text-gray-400 marker:text-gray-300">
                            <li>Ter no mínimo 18 (dezoito) anos de idade;</li>
                            <li>Possuir capacidade civil plena para aceitar estes Termos;</li>
                            <li>Fornecer informações verdadeiras, completas e atualizadas no cadastro.</li>
                        </ul>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Menores de 18 anos não estão autorizados a utilizar o App. A FitMind não coleta intencionalmente dados de menores.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">4. Conta do Usuário</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-2">Ao se cadastrar, você é responsável por manter a confidencialidade de suas credenciais, por todas as atividades em sua conta e por notificar a FitMind sobre qualquer uso não autorizado.</p>
                        <p className="text-gray-500 dark:text-gray-400">A FitMind se reserva o direito de suspender ou encerrar contas que violem estes Termos, apresentem uso fraudulento ou comportamento abusivo na plataforma.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">5. Uso de Inteligência Artificial</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-3">O FitMind utiliza modelos de Inteligência Artificial (Google Gemini) para funcionalidades como:</p>
                        <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                            <li><strong>CalorieCam:</strong> Estimativa de calorias e macronutrientes a partir de fotos;</li>
                            <li><strong>Personal Trainer IA:</strong> Sugestões de treinos personalizados;</li>
                            <li><strong>Chat Inteligente:</strong> Respostas a dúvidas sobre nutrição e saúde.</li>
                        </ul>
                        <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30">
                            <p className="text-xs text-orange-800 dark:text-orange-300 font-bold uppercase mb-1">Importante</p>
                            <p className="text-xs text-orange-700 dark:text-orange-400 leading-relaxed">A IA pode gerar informações imprecisas. As contagens são estimativas aproximadas e não devem ser base única para decisões críticas de saúde, dosagem de medicamentos ou substituição de orientação médica profissional.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">6. Assinatura e Pagamentos</h2>
                        <div className="space-y-3 text-gray-500 dark:text-gray-400 text-sm">
                            <p><strong>6.1. Planos:</strong> Oferecemos planos (mensal/anual) para acesso PRO. Preços vigentes são exibidos na tela de assinatura.</p>
                            <p><strong>6.2. Processamento:</strong> Pagamentos processados via Stripe, Inc. Não armazenamos dados completos de cartão em nossos servidores.</p>
                            <p><strong>6.3. Renovação:</strong> Automática ao final de cada período, a menos que cancelada com 24h de antecedência.</p>
                            <p><strong>6.4. Cancelamento:</strong> Pode ser feito em Ajustes {'>'} Privacidade e Segurança {'>'} Cancelar Assinatura. O acesso permanece até o fim do período pago.</p>
                            <p><strong>6.5. Direito de Arrependimento:</strong> Conforme Art. 49 do CDC, o Usuário tem 7 dias para arrependimento após a primeira compra, com reembolso integral via contato@fitmindhealth.com.br.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">7. Usos Proibidos</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-2">O Usuário se compromete a não utilizar o App para fins ilegais, não compartilhar credenciais, não realizar engenharia reversa ou scraping, e não tentar acessar dados de outros usuários.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">8. Propriedade Intelectual</h2>
                        <p className="text-gray-500 dark:text-gray-400">Todo o design, código-fonte, textos, gráficos, logotipos, marcas e funcionalidades do FitMind são de propriedade exclusiva da FitMind Health Technologies. É concedida uma licença limitada para uso pessoal durante a vigência da assinatura.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">9. Disponibilidade do Serviço</h2>
                        <p className="text-gray-500 dark:text-gray-400">Empenhamo-nos para manter o App disponível 24/7, mas não garantimos disponibilidade ininterrupta devido a manutenções ou força maior.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">10. Limitação de Responsabilidade</h2>
                        <p className="text-gray-500 dark:text-gray-400">A FitMind não se responsabiliza por danos indiretos decorrentes do uso do App. Nossa responsabilidade total é limitada ao valor pago pelo Usuário nos últimos 12 meses.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">11. Alteração dos Termos</h2>
                        <p className="text-gray-500 dark:text-gray-400">Reservamo-nos o direito de modificar estes Termos. Alterações serão comunicadas com 15 dias de antecedência.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">12. Legislação Aplicável e Foro</h2>
                        <p className="text-gray-500 dark:text-gray-400">Regidos pelas leis do Brasil. Fica eleito o foro do domicílio do consumidor (Art. 101, I do CDC).</p>
                    </section>

                    <hr className="border-gray-200 dark:border-gray-800" />

                    {/* ISENÇÃO MÉDICA - Discreta no final */}
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Isenção de Responsabilidade Médica</h2>
                        <div className="text-xs text-gray-400 dark:text-gray-600 space-y-2 leading-relaxed text-justify">
                            <p>O CONTEÚDO DESTE APLICATIVO TEM CARÁTER MERAMENTE INFORMATIVO E EDUCACIONAL. A FITMIND NÃO É UMA CLÍNICA MÉDICA E NÃO FORNECE ACONSELHAMENTO, DIAGNÓSTICO OU TRATAMENTO MÉDICO.</p>
                            <p>O uso de medicamentos como Ozempic, Mounjaro, Wegovy, Saxenda e similares deve ser estritamente orientado e prescrito por um médico qualificado. Nenhuma funcionalidade do aplicativo substitui a orientação profissional. Nunca altere sua medicação com base em informações do FitMind. Em caso de emergência médica, contate o serviço de saúde imediatamente (SAMU: 192).</p>
                        </div>
                    </section>

                    <div className="pt-8 text-center text-xs text-gray-300 dark:text-gray-700">
                        <p className="font-bold">FitMind Health Technologies</p>
                        <p>CNPJ: 65.458.597/0001-68</p>
                        <p>contato@fitmindhealth.com.br</p>
                        <p className="mt-2">Última atualização: Março de 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
