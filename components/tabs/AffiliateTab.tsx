
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';
import { motion } from 'framer-motion';
import { ShareIcon, CopyIcon, TrendingUpIcon, WalletIcon, UsersIcon, GiftIcon, ChevronLeftIcon } from '../core/Icons';
import { useNavigate } from 'react-router-dom';

export const AffiliateTab: React.FC = () => {
    const { userData } = useAppContext();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [affiliate, setAffiliate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [customCode, setCustomCode] = useState('');

    useEffect(() => {
        if (userData) {
            fetchAffiliateData();
        }
    }, [userData]);

    const fetchAffiliateData = async () => {
        try {
            const { data, error } = await supabase
                .from('affiliates')
                .select('*')
                .eq('user_id', userData?.id)
                .maybeSingle();

            if (data) {
                setAffiliate(data);
            }
        } catch (err) {
            console.error("Error fetching affiliate data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAffiliate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData || !customCode) return;

        setCreating(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-affiliate', {
                body: {
                    code: customCode,
                    userId: userData.id,
                    discountRate: 10,
                    commissionRate: 20
                }
            });

            if (error) throw error;

            if (data.success) {
                addToast("Parabéns! Você agora é um afiliado.", "success");
                setAffiliate(data.affiliate);
            } else {
                addToast(data.error || "Erro ao criar afiliado.", "error");
            }
        } catch (err: any) {
            addToast(err.message || "Erro de conexão.", "error");
        } finally {
            setCreating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        addToast("Link copiado!", "success");
    };

    const shareLink = () => {
        const link = `https://fitmindhealth.com.br/?ref=${affiliate.code}`;
        if (navigator.share) {
            navigator.share({
                title: 'FitMind - Transforme seu corpo',
                text: 'Use meu cupom para ganhar 10% de desconto no FitMind!',
                url: link,
            });
        } else {
            copyToClipboard(link);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-ios-bg dark:bg-ios-dark-bg">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-black dark:border-gray-700 dark:border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="px-5 pb-24 min-h-screen animate-fade-in bg-ios-bg dark:bg-ios-dark-bg">
            <header className="mb-8 mt-4 flex items-center gap-4">
                <button onClick={() => navigate('/settings')} className="p-2 -ml-2 text-gray-500 dark:text-gray-400">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Programa de Afiliados</h1>
            </header>

            {!affiliate ? (
                <div className="space-y-6">
                    <div className="bg-ios-card dark:bg-ios-dark-card p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                            <GiftIcon className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ganhe dinheiro indicando o FitMind</h2>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                            Seja um parceiro FitMind. Seus amigos ganham <span className="text-green-500 font-bold">10% de desconto</span> e você ganha <span className="text-blue-500 font-bold">20% de comissão</span> sobre cada assinatura realizada.
                        </p>

                        <form onSubmit={handleCreateAffiliate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 ml-1">Escolha seu código único</label>
                                <input 
                                    type="text" 
                                    value={customCode}
                                    onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                    placeholder="EX: JOAO10"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold tracking-widest uppercase focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    maxLength={15}
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-2 ml-1">Este será o seu cupom de desconto.</p>
                            </div>

                            <button 
                                type="submit"
                                disabled={creating || !customCode}
                                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all disabled:opacity-50"
                            >
                                {creating ? 'Criando...' : 'Ativar meu Cupom'}
                            </button>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-start gap-4 p-4">
                            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg text-green-600 dark:text-green-400">
                                <CheckCircleIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Pagamentos Rápidos</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Receba suas comissões diretamente via PIX.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4">
                            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                <TrendingUpIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Rastreamento em Tempo Real</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Acompanhe cada clique e venda no seu painel.</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-ios-card dark:bg-ios-dark-card p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="text-blue-500 mb-2"><WalletIcon className="w-6 h-6" /></div>
                            <div className="text-2xl font-black text-gray-900 dark:text-white">R$ {affiliate.balance.toFixed(2)}</div>
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Saldo Disponível</div>
                        </div>
                        <div className="bg-ios-card dark:bg-ios-dark-card p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="text-green-500 mb-2"><UsersIcon className="w-6 h-6" /></div>
                            <div className="text-2xl font-black text-gray-900 dark:text-white">{affiliate.conversions}</div>
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Vendas Realizadas</div>
                        </div>
                    </div>

                    {/* Referral Link Card */}
                    <div className="bg-ios-card dark:bg-ios-dark-card p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Seu Link de Afiliado</h3>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 mb-4">
                            <span className="flex-grow text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                                fitmindhealth.com.br/?ref={affiliate.code}
                            </span>
                            <button onClick={() => copyToClipboard(`https://fitmindhealth.com.br/?ref=${affiliate.code}`)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                <CopyIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <button 
                            onClick={shareLink}
                            className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <ShareIcon className="w-5 h-5" />
                            Compartilhar Link
                        </button>
                    </div>

                    {/* Details Card */}
                    <div className="bg-ios-card dark:bg-ios-dark-card rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Detalhes do Programa</h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            <div className="p-4 flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Seu Cupom</span>
                                <span className="font-bold text-blue-500">{affiliate.code}</span>
                            </div>
                            <div className="p-4 flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Desconto p/ Amigos</span>
                                <span className="font-bold text-green-500">{affiliate.discount_rate}% OFF</span>
                            </div>
                            <div className="p-4 flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Sua Comissão</span>
                                <span className="font-bold text-gray-900 dark:text-white">{affiliate.commission_rate}%</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 px-6">
                        As comissões são pagas mensalmente via PIX para saldos acima de R$ 50,00. Entre em contato com o suporte para cadastrar sua chave PIX.
                    </p>
                </div>
            )}
        </div>
    );
};

const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
