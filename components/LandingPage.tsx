
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
    ShieldCheckIcon, 
    CameraIcon, 
    FlameIcon, 
    BarChartIcon, 
    LockIcon,
    ChevronRightIcon
} from './core/Icons';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white dark:bg-black font-sans overflow-x-hidden">
            {/* Navigation */}
            <motion.nav 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex justify-between items-center p-6 max-w-7xl mx-auto"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-black"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">FitMind</span>
                </div>
                <button 
                    onClick={() => navigate('/auth')}
                    className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                    Entrar
                </button>
            </motion.nav>

            {/* Hero Section */}
            <section className="px-6 pt-12 pb-20 max-w-7xl mx-auto text-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-900/30 mb-8"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-widest">O Sistema #1 para usuários de GLP-1</span>
                </motion.div>

                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.05] mb-6 max-w-4xl mx-auto"
                >
                    Transforme seu tratamento em <span className="text-blue-600">resultados reais.</span>
                </motion.h1>
                
                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
                >
                    O primeiro sistema operacional completo desenhado especificamente para quem usa Ozempic, Mounjaro e Wegovy.
                </motion.p>

                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button 
                        onClick={() => navigate('/auth')}
                        className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-2xl text-lg font-bold shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                        Começar Agora
                        <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                        <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                        14 dias grátis • Cancele quando quiser
                    </div>
                </motion.div>

                {/* Social Proof */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 flex flex-col items-center"
                >
                    <div className="flex -space-x-3 mb-4">
                        {[1,2,3,4,5].map(i => (
                            <img 
                                key={i}
                                src={`https://picsum.photos/seed/${i + 10}/100/100`} 
                                className="w-10 h-10 rounded-full border-2 border-white dark:border-black shadow-sm"
                                alt="User"
                                referrerPolicy="no-referrer"
                            />
                        ))}
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                        Junte-se a <span className="text-gray-900 dark:text-white">+15.000 pessoas</span> que já mudaram de vida.
                    </p>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="bg-gray-50 dark:bg-[#0A0A0A] py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Tudo o que você precisa em um só lugar.</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Ferramentas inteligentes que trabalham com a sua biologia, não contra ela.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard 
                            icon={<CameraIcon className="w-6 h-6" />}
                            title="CalorieCam IA"
                            description="Tire uma foto e saiba instantaneamente os macros da sua refeição."
                            color="bg-blue-500"
                            delay={0.1}
                        />
                        <FeatureCard 
                            icon={<FlameIcon className="w-6 h-6" />}
                            title="Treinos Adaptativos"
                            description="Exercícios que respeitam seu nível de energia e efeitos colaterais."
                            color="bg-orange-500"
                            delay={0.2}
                        />
                        <FeatureCard 
                            icon={<BarChartIcon className="w-6 h-6" />}
                            title="Análise de Progresso"
                            description="Gráficos detalhados e insights sobre sua evolução real."
                            color="bg-purple-500"
                            delay={0.3}
                        />
                        <FeatureCard 
                            icon={<LockIcon className="w-6 h-6" />}
                            title="Protocolo Anti-Rebote"
                            description="Estratégias para manter o peso após o fim do tratamento."
                            color="bg-green-500"
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            {/* Testimonial Section */}
            <section className="py-24 px-6 max-w-4xl mx-auto text-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <div className="flex justify-center gap-1 text-yellow-500 mb-4">
                        {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white italic leading-tight">
                        "O FitMind me deu a segurança que eu precisava. Em 4 semanas, perdi 5kg e as náuseas desapareceram."
                    </h2>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-center gap-4"
                >
                    <img src="https://picsum.photos/seed/ana/100/100" className="w-12 h-12 rounded-full" alt="Ana" referrerPolicy="no-referrer" />
                    <div className="text-left">
                        <p className="font-bold text-gray-900 dark:text-white">Ana Paula, 34 anos</p>
                        <p className="text-sm text-gray-500 font-medium">Usuária de Ozempic + FitMind</p>
                    </div>
                </motion.div>
            </section>

            {/* Nutritionist Section */}
            <section className="py-24 px-6 bg-white dark:bg-[#0A0A0A] border-y border-gray-100 dark:border-gray-900">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-6 shadow-sm">
                        <span className="text-2xl font-light text-gray-900 dark:text-white tracking-widest">AS</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Allan Stachuk</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Nutricionista Oficial • CRN 13901</p>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic">
                        "O FitMind não é apenas um aplicativo, é um método clínico traduzido para a tecnologia. Cada protocolo foi rigorosamente validado para garantir resultados reais e seguros durante o seu tratamento."
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-black dark:bg-white rounded flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-black"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                        </div>
                        <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">FitMind</span>
                    </div>
                    <div className="flex gap-8 text-sm font-bold text-gray-400">
                        <button onClick={() => navigate('/terms')} className="hover:text-black dark:hover:text-white">Termos</button>
                        <button onClick={() => navigate('/privacy')} className="hover:text-black dark:hover:text-white">Privacidade</button>
                        <a href="mailto:suporte@fitmind.app" className="hover:text-black dark:hover:text-white">Suporte</a>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">© 2024 FitMind. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; color: string; delay: number }> = ({ icon, title, description, color, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
    >
        <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center mb-6 shadow-lg`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{description}</p>
    </motion.div>
);
