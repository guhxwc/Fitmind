import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Calendar, FileText, Trash2, Edit3, MoreVertical, Sparkles } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface Props {
  patient: any;
  onBack: () => void;
  onEditPlan: (planId?: string) => void;
}

export const FullPlanManager: React.FC<Props> = ({ patient, onBack, onEditPlan }) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('patient_plans')
        .select('*')
        .eq('user_id', patient.user_id)
        .order('created_at', { ascending: false });
      
      setPlans(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId: string) => {
    try {
      await supabase.from('patient_plans').delete().eq('id', planId);
      loadPlans();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#F9FAFC] dark:bg-[#0B0C10] z-[105] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Planos Personalizados</h2>
            <p className="text-[12px] text-gray-500 font-medium mt-0.5">Gerencie as fases e planos completos</p>
          </div>
        </div>
        <button
          onClick={() => onEditPlan()}
          className="bg-[#007AFF] text-white px-4 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-[#0056b3] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Criar novo plano
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <p className="text-gray-500 font-medium text-sm">Carregando planos...</p>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[24px] border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-[#007AFF]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum plano criado</h3>
              <p className="text-gray-500 text-sm text-center max-w-sm mb-6">
                Crie um plano completo personalizado com dieta, metas e agendamento integrados.
              </p>
              <button
                onClick={() => onEditPlan()}
                className="bg-[#007AFF] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0056b3] shadow-sm transition-all"
              >
                Começar primeiro plano
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {plans.map((p, i) => (
                <div key={p.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#007AFF]/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${i === 0 ? 'bg-[#007AFF] text-white' : 'bg-gray-50 text-gray-400'}`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">{p.title || 'Plano Alimentar'}</h4>
                        {i === 0 && <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold uppercase rounded pr-1 tracking-wider">Atual</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 opacity-80">
                        <p className="text-[12px] text-gray-500 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Última atualização: {new Date(p.updated_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {/* Botões minimalistas */}
                    <button
                      onClick={() => onEditPlan(p.id)}
                      className="p-2 text-gray-400 hover:text-[#007AFF] hover:bg-blue-50 rounded-lg transition-colors tooltip"
                      title="Editar plano"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors tooltip"
                      title="Excluir plano"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
