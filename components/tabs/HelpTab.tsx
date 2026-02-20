
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Chat } from "@google/genai";

interface Message {
    role: 'user' | 'model';
    content: string;
}

const UserMessage: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex justify-end mb-4">
        <div className="bg-black dark:bg-blue-600 text-white rounded-2xl rounded-br-md py-2 px-4 max-w-xs sm:max-w-sm lg:max-w-md animate-fade-in">
            <p className="whitespace-pre-wrap">{text}</p>
        </div>
    </div>
);

const renderMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g).filter(part => part);

    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </>
    );
};

const ModelMessage: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex justify-start mb-4">
        <div className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-2xl rounded-bl-md py-2 px-4 max-w-xs sm:max-w-sm lg:max-w-md animate-fade-in">
            <p className="whitespace-pre-wrap">{renderMarkdown(text)}</p>
        </div>
    </div>
);

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start mb-4">
    <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl rounded-bl-md py-3 px-4 animate-fade-in">
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

export const HelpTab: React.FC = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Olá! Sou o assistente do FitMind. Como posso ajudar você a usar o app hoje?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            if (!chatRef.current) {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
                chatRef.current = ai.chats.create({
                    model: 'gemini-3-flash-preview',
                    config: {
                      systemInstruction: "Você é o 'Assistente FitMind', um chatbot amigável e prestativo, especialista no aplicativo FitMind. Sua única função é responder perguntas sobre como usar o aplicativo FitMind, seus recursos (como CalorieCam, planos de dieta e treino com IA, registro de aplicações), a assinatura PRO, e solucionar problemas comuns. Use **negrito** para destacar nomes de recursos ou ações importantes. Seja conciso, claro e use um tom encorajador. NÃO responda a perguntas que não sejam sobre o aplicativo FitMind. Se perguntarem algo fora do escopo, gentilmente redirecione a conversa de volta para o app.",
                    },
                });
            }
            
            const response = await chatRef.current.sendMessage({ message: userMessage.content });
            const modelMessage: Message = { role: 'model', content: response.text };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            const errorMessage: Message = { role: 'model', content: "Desculpe, não consegui processar sua pergunta. Tente novamente." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-black">
            <header className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800">
                <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-300 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <div className="text-center flex-grow">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Assistente FitMind</h1>
                    <p className="text-sm text-green-500 font-semibold">Online</p>
                </div>
                <div className="w-10"></div>
            </header>

            <main ref={chatContainerRef} className="flex-grow overflow-y-auto p-4">
                {messages.map((msg, index) => (
                    msg.role === 'user' ? <UserMessage key={index} text={msg.content} /> : <ModelMessage key={index} text={msg.content} />
                ))}
                {isLoading && <TypingIndicator />}
            </main>

            <footer className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Digite sua dúvida..."
                        className="flex-grow w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-white"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="bg-black dark:bg-white text-white dark:text-black rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 disabled:bg-gray-300 dark:disabled:bg-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </footer>
        </div>
    );
};
