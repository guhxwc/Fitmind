import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft, Stethoscope, Upload, Search, X, Plus, FileText,
  Trash2, Eye, Calendar as CalendarIcon, ChevronDown, Microscope,
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import {
  examsService, ExamType, EXAM_TYPE_META, formatBytes, PatientExam,
} from '../../services/materialsExamsService';

/* =========================================================
   UPLOAD MODAL
========================================================= */
interface UploadModalProps {
  userId: string;
  nutritionistId: string | null;
  onClose: () => void;
  onSent: () => void;
}

const UploadExamModal: React.FC<UploadModalProps> = ({ userId, nutritionistId, onClose, onSent }: UploadModalProps) => {
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState<ExamType>('blood');
  const [examDate, setExamDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
  };

  const canSubmit = !!title.trim() && !!file;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true); setError(null);
    try {
      await examsService.create({
        userId,
        nutritionistId,
        title: title.trim(),
        exam_type: examType,
        exam_date: examDate || null,
        observations: observations.trim() || null,
        file,
      });
      onSent();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Erro ao enviar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-[520px] shadow-2xl my-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold text-gray-900">Adicionar exame</h3>
            <p className="text-[12px] text-gray-500 mt-0.5">Anexe o resultado do paciente.</p>
          </div>
          <button onClick={onClose} className="p-1.5 -mr-1.5 hover:bg-gray-100 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[12px] font-bold px-3 py-2 rounded-xl">{error}</div>}

          {/* Tipo */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Tipo de exame</label>
            <div className="grid grid-cols-3 gap-2">
              {(['blood','hormone','imaging','urine','biopsy','other'] as ExamType[]).map((t) => {
                const meta = EXAM_TYPE_META[t];
                const active = examType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setExamType(t)}
                    className={`py-2.5 rounded-xl border-2 transition-all text-[11px] font-bold ${
                      active ? `border-blue-500 ${meta.bg} ${meta.color}` : 'border-gray-100 text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Título</label>
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Hemograma completo"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl h-[44px] px-3.5 text-[13px] font-semibold text-gray-900 outline-none focus:border-blue-500 placeholder:font-normal placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Data do exame</label>
              <input
                type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl h-[44px] px-3.5 text-[13px] font-semibold text-gray-900 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Observações</label>
            <textarea
              value={observations} onChange={(e) => setObservations(e.target.value)} rows={2}
              placeholder="Notas do nutricionista..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-gray-900 outline-none focus:border-blue-500 placeholder:font-normal placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Arquivo */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Arquivo (PDF ou imagem)</label>
            {file ? (
              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-blue-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-gray-900 truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{formatBytes(file.size)}</p>
                </div>
                <button onClick={() => setFile(null)} className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-xl p-6 text-center cursor-pointer transition-all"
              >
                <Upload className="w-7 h-7 text-gray-400 mx-auto mb-2" />
                <p className="text-[12px] font-bold text-gray-700">Clique ou arraste</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">PDF ou imagem, até 50MB</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" hidden accept="application/pdf,image/*" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancelar</button>
          <button
            onClick={submit}
            disabled={!canSubmit || saving}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enviando...' : 'Adicionar exame'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN VIEW
========================================================= */
interface Props {
  patient: any;             // Sempre filtrado por paciente (cada paciente tem aba)
  nutritionistId: string | null;
  onBack: () => void;
}

export const ExamsView: React.FC<Props> = ({ patient, nutritionistId, onBack }) => {
  const [items, setItems] = useState<PatientExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ExamType>('all');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<PatientExam | null>(null);

  const userId = patient?.user_id;
  const patientName = patient?.profiles?.name || 'Paciente';

  const loadAll = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const list = await examsService.listForPatient(userId);
      setItems(list);
    } catch (err) {
      console.error('[ExamsView] load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [userId]);

  // Realtime
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`exams_view_${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'patient_exams', filter: `user_id=eq.${userId}` },
        () => loadAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line
  }, [userId]);

  const filtered = useMemo(() => {
    let out = items;
    if (filter !== 'all') out = out.filter((i) => i.exam_type === filter);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      out = out.filter((i) =>
        i.title.toLowerCase().includes(q) ||
        (i.observations || '').toLowerCase().includes(q)
      );
    }
    return out;
  }, [items, filter, search]);

  const handleOpen = async (e: PatientExam) => {
    try {
      const url = await examsService.getOpenUrl(e);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      alert('Erro ao abrir: ' + (err?.message || ''));
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await examsService.remove(confirmDelete);
      setConfirmDelete(null);
      loadAll();
    } catch (err: any) {
      alert('Erro ao excluir: ' + (err?.message || ''));
    }
  };

  // Agrupa por mês
  const grouped = useMemo(() => {
    const groups: Record<string, PatientExam[]> = {};
    filtered.forEach((e) => {
      const ref = e.exam_date || e.created_at;
      const d = new Date(ref);
      const key = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="fixed inset-0 bg-[#F9FAFC] z-[110] overflow-y-auto font-sans">
      <main className="px-4 lg:px-10 py-8">
        <div className="max-w-[1100px] mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="text-[12px] font-semibold text-gray-500">{patientName}</p>
                <h1 className="text-[24px] font-extrabold text-gray-900 tracking-tight">Exames</h1>
              </div>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(59,130,246,0.30)] transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={3} /> Adicionar exame
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-2xl p-3 border border-gray-100 mb-6 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3 focus-within:border-blue-400">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar exame..."
                className="flex-1 bg-transparent px-2.5 py-2 text-[13px] font-medium text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
            <div className="flex bg-gray-50 p-1 rounded-xl flex-wrap">
              {(['all','blood','hormone','imaging','urine','biopsy','other'] as const).map((f) => {
                const lbl = f === 'all' ? 'Todos' : EXAM_TYPE_META[f as ExamType].label;
                return (
                  <button key={f} onClick={() => setFilter(f as any)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                      filter === f ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}>
                    {lbl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista cronológica */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-[80px] animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 py-16 text-center">
              <Microscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-[15px] font-bold text-gray-700">
                {search || filter !== 'all' ? 'Nenhum resultado' : 'Nenhum exame anexado'}
              </p>
              <p className="text-[12px] text-gray-500 mt-1">
                {search || filter !== 'all' ? 'Tente alterar os filtros.' : 'Clique em "Adicionar exame" pra começar.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([month, list]) => (
                <div key={month}>
                  <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-3 capitalize">{month}</h3>
                  <div className="space-y-2">
                    {list.map((e) => {
                      const meta = EXAM_TYPE_META[e.exam_type];
                      const date = e.exam_date || e.created_at;
                      return (
                        <div key={e.id} className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${meta.bg} ${meta.color} shrink-0`}>
                            <Microscope className="w-5 h-5" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <h3 className="text-[14px] font-bold text-gray-900 truncate">{e.title}</h3>
                              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${meta.bg} ${meta.color} uppercase tracking-wide`}>{meta.label}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 flex-wrap">
                              <CalendarIcon className="w-3 h-3" />
                              {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                              {e.file_size && (<><span>•</span><span>{formatBytes(e.file_size)}</span></>)}
                              {e.observations && (<><span>•</span><span className="truncate italic">"{e.observations}"</span></>)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {e.file_path && (
                              <button onClick={() => handleOpen(e)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-700 text-[12px] font-bold rounded-xl transition-colors">
                                <Eye className="w-3.5 h-3.5" /> Abrir
                              </button>
                            )}
                            <button onClick={() => setConfirmDelete(e)} className="p-2 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-xl transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showUpload && userId && (
        <UploadExamModal userId={userId} nutritionistId={nutritionistId} onClose={() => setShowUpload(false)} onSent={loadAll} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[400] bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-[400px] p-6 shadow-2xl">
            <h3 className="text-[16px] font-bold text-gray-900 mb-1">Excluir exame?</h3>
            <p className="text-[13px] text-gray-500">"{confirmDelete.title}" será removido permanentemente.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancelar</button>
              <button onClick={handleDelete} className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-[13px] font-bold rounded-xl">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
