
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
                        Compromisso com a Lei Geral de Proteção de Dados (LGPD) e transparência total sobre seus dados.
                    </p>
                </div>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">1. Controlador dos Dados</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            A FitMind Health Technologies atua como controladora. Dúvidas sobre dados podem ser enviadas ao nosso Encarregado (DPO) através do e-mail <a href="mailto:privacy@fitmind.app" className="text-blue-500 underline">privacy@fitmind.app</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">2. Dados Coletados</h2>
                        <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                            <table className="min-w-full text-xs text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                                    <tr>
                                        <th className="py-3 px-4 font-bold text-gray-400 uppercase tracking-wider">Dado</th>
                                        <th className="py-3 px-4 font-bold text-gray-400 uppercase tracking-wider">Finalidade & Base Legal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    <tr>
                                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white align-top">Identificação<br/><span className="text-gray-400 font-normal">Nome, E-mail</span></td>
                                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">Criação de conta e suporte.<br/><em>(Execução de Contrato)</em></td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white align-top">Saúde (Sensível)<br/><span className="text-gray-400 font-normal">Peso, Medicação, Fotos</span></td>
                                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">Funcionalidades principais do app.<br/><em>(Consentimento Explícito)</em></td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white align-top">Pagamento<br/><span className="text-gray-400 font-normal">Histórico, Token</span></td>
                                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">Processamento de assinaturas.<br/><em>(Execução de Contrato)</em></td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white align-top">Uso & Logs<br/><span className="text-gray-400 font-normal">Acessos, Eventos</span></td>
                                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">Melhoria do serviço e segurança.<br/><em>(Legítimo Interesse)</em></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">3. Compartilhamento (Operadores)</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-[#1C1C1E] rounded-xl border border-gray-100 dark:border-gray-800">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">Supabase</p>
                                    <p className="text-xs text-gray-500">Infraestrutura de Banco de Dados</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-[#1C1C1E] rounded-xl border border-gray-100 dark:border-gray-800">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">Google Gemini (AI)</p>
                                    <p className="text-xs text-gray-500">Processamento de texto e imagem (Anonimizado)</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-[#1C1C1E] rounded-xl border border-gray-100 dark:border-gray-800">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">Stripe</p>
                                    <p className="text-xs text-gray-500">Processamento seguro de pagamentos</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-[#1C1C1E] rounded-xl border border-gray-100 dark:border-gray-800">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">Firebase</p>
                                    <p className="text-xs text-gray-500">Notificações Push e Analytics</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">4. Segurança e Retenção</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Utilizamos criptografia em trânsito (HTTPS) e em repouso. Seus dados são mantidos enquanto sua conta estiver ativa.</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-500 dark:text-gray-400 marker:text-gray-300">
                            <li><strong>Conta Excluída:</strong> Dados são mantidos em backup por até 30 dias e depois removidos permanentemente.</li>
                            <li><strong>Logs:</strong> Mantidos por até 6 meses para auditoria de segurança.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">5. Seus Direitos</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Você tem total controle. No menu "Ajustes {'>'} Privacidade", você pode:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-500 dark:text-gray-400 marker:text-gray-300">
                            <li>Solicitar cópia dos seus dados (Portabilidade).</li>
                            <li>Corrigir dados cadastrais.</li>
                            <li>Excluir permanentemente sua conta e dados.</li>
                            <li>Revogar consentimentos dados anteriormente.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">6. Menores de Idade</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">O FitMind não é destinado a menores de 18 anos. Não coletamos intencionalmente dados de crianças ou adolescentes.</p>
                    </section>

                    <div className="pt-8 text-center text-xs text-gray-300 dark:text-gray-700 border-t border-gray-100 dark:border-gray-800 mt-8">
                        <p>FitMind Health Technologies</p>
                        <p>privacy@fitmind.app</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
