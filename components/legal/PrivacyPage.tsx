
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, LockIcon } from '../core/Icons';

export const PrivacyPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-black font-sans animate-fade-in flex flex-col">
            <div className="sticky top-0 z-20 bg-[#F2F2F7]/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800">
                <div className="px-4 h-14 flex items-center justify-between max-w-md mx-auto">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-blue-500 hover:text-blue-600 font-medium text-[17px] flex items-center gap-1">
                        <ChevronLeftIcon className="w-5 h-5" />
                        Voltar
                    </button>
                    <h1 className="font-semibold text-[17px] text-gray-900 dark:text-white">Política de Privacidade</h1>
                    <div className="w-16"></div>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto px-5 py-6 max-w-md mx-auto pb-24 text-gray-800 dark:text-gray-300 text-[15px] leading-relaxed">
                
                {/* Header Discreto */}
                <div className="mb-10 text-center px-4">
                    <div className="w-12 h-12 bg-white dark:bg-[#1C1C1E] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 dark:border-gray-800 text-gray-400">
                        <LockIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Em conformidade com a LGPD (Lei 13.709/2018) e transparência total sobre seus dados.
                    </p>
                </div>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">1. Controlador dos Dados</h2>
                        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-sm space-y-2">
                            <p><span className="text-gray-400">Razão Social:</span> <span className="font-medium text-gray-900 dark:text-white">FitMind Health Technologies</span></p>
                            <p><span className="text-gray-400">CNPJ:</span> <span className="font-medium text-gray-900 dark:text-white">65.458.597/0001-68</span></p>
                            <p><span className="text-gray-400">E-mail do DPO:</span> <a href="mailto:contato@fitmindhealth.com.br" className="text-blue-500 font-medium">contato@fitmindhealth.com.br</a></p>
                            <p><span className="text-gray-400">Website:</span> <a href="https://fitmindhealth.com.br" target="_blank" rel="noopener noreferrer" className="text-blue-500 font-medium">fitmindhealth.com.br</a></p>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-3 leading-relaxed">
                            A FitMind Health Technologies atua como controladora dos dados pessoais. O Encarregado de Proteção de Dados (DPO) pode ser contatado pelo e-mail acima para quaisquer questões.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">2. Dados Pessoais Coletados</h2>
                        <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                            <table className="min-w-full text-[11px] text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                                    <tr>
                                        <th className="py-3 px-3 font-bold text-gray-400 uppercase tracking-wider">Categoria</th>
                                        <th className="py-3 px-3 font-bold text-gray-400 uppercase tracking-wider">Dados & Finalidade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    <tr>
                                        <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white align-top">Identificação</td>
                                        <td className="py-3 px-3 text-gray-500 dark:text-gray-400">Nome, e-mail, senha (hash). Criação de conta e autenticação.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white align-top">Saúde (Sensível)</td>
                                        <td className="py-3 px-3 text-gray-500 dark:text-gray-400">Peso, altura, IMC, medicação, fotos de refeições, histórico. Funcionalidades principais.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white align-top">Pagamento</td>
                                        <td className="py-3 px-3 text-gray-500 dark:text-gray-400">Histórico, token Stripe. Processamento de assinaturas.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white align-top">Uso & Técnicos</td>
                                        <td className="py-3 px-3 text-gray-500 dark:text-gray-400">Logs, dispositivo, IP. Segurança e melhoria do serviço.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-3 italic">
                            Dados sensíveis de saúde são coletados somente com seu consentimento explícito. Você pode revogá-lo a qualquer momento.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">3. Compartilhamento (Operadores)</h2>
                        <div className="space-y-2">
                            {[
                                { name: 'Supabase (AWS)', desc: 'Infraestrutura e autenticação', loc: 'EUA' },
                                { name: 'Google (Gemini AI)', desc: 'Processamento de IA', loc: 'EUA' },
                                { name: 'Stripe, Inc.', desc: 'Pagamentos seguros', loc: 'EUA' },
                                { name: 'Firebase (Google)', desc: 'Notificações e analytics', loc: 'EUA' }
                            ].map((op, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white dark:bg-[#1C1C1E] rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{op.name}</p>
                                        <p className="text-[11px] text-gray-500">{op.desc}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-md">{op.loc}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">4. Transferência Internacional</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            Seus dados são processados em servidores nos EUA pelos operadores listados acima, com base no Art. 33 da LGPD, observando padrões compatíveis de proteção de dados.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">5. Segurança dos Dados</h2>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-500 dark:text-gray-400 marker:text-gray-300">
                            <li>Criptografia em trânsito (HTTPS/TLS) e em repouso (AES-256);</li>
                            <li>Senhas com hash bcrypt;</li>
                            <li>Row Level Security (RLS) no banco de dados;</li>
                            <li>Autenticação via JWT com expiração.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">6. Retenção de Dados</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Dados de saúde são excluídos imediatamente após a exclusão da conta. Logs de segurança são mantidos por 6 meses conforme o Marco Civil da Internet.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">7. Seus Direitos (Art. 18 LGPD)</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Você pode exercer seus direitos de confirmação, acesso, correção, eliminação, portabilidade e revogação de consentimento.</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs italic">
                            Solicitações via contato@fitmindhealth.com.br serão respondidas em até 15 dias úteis.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">8. Cookies e Armazenamento</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Utilizamos localStorage para preferências e tokens de sessão. Não utilizamos cookies de rastreamento de terceiros para fins publicitários.
                        </p>
                    </section>

                    <div className="pt-8 text-center text-xs text-gray-300 dark:text-gray-700 border-t border-gray-100 dark:border-gray-800 mt-8">
                        <p className="font-bold">FitMind Health Technologies</p>
                        <p>CNPJ: 65.458.597/0001-68</p>
                        <p>contato@fitmindhealth.com.br</p>
                        <p className="mt-1">Última atualização: Março de 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
