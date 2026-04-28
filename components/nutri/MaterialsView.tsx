import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft, FileText, Upload, Search, Filter, Trash2, ExternalLink,
  X, Plus, FileImage, Film, Link2, FileCode, File as FileIcon,
  CheckCircle2, Eye, Calendar as CalendarIcon, ChevronDown,
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import {
  materialsService, MaterialType, MATERIAL_TYPE_META, formatBytes,
  detectMaterialType, PatientMaterial,
} from '../../services/materialsExamsService';

interface Patient {
  user_id: string;
  name?: string;
}

const ICON_BY_TYPE: Record<MaterialType, React.ComponentType<any>> = {
  pdf: FileText, image: FileImage, video: Film, link: Link2, doc: FileCode, other: FileIcon,
};

/* =========================================================
   UPLOAD MODAL
========================================================= */
interface UploadModalProps {
  patients: Patient[];
  defaultPatientId?: string | null;
  nutritionistId: string | null;
  onClose: () => void;
  onSent: () => void;
}

const UploadMaterialModal: React.FC<UploadModalProps> = ({ patients, defaultPatientId, nutritionistId, onClose, onSent }) => {
  const [selectedPatient, setSelectedPatient] = useState<string>(defaultPatientId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MaterialType>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
    setType(detectMaterialType(f.type));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileChange(f);
  };

  const canSubmit = !!selectedPatient && !!title.trim() && (type === 'link' ? !!externalUrl.trim() : !!file);

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true); setError(null);
    try {
      await materialsService.create({
        userId: selectedPatient,
        nutritionistId,
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        file: type === 'link' ? null : file,
        external_url: type === 'link' ? externalUrl.trim() : null,
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
            <h3 className="text-[17px] font-bold text-gray-900">Enviar material</h3>
            <p className="text-[12px] text-gray-500 mt-0.5">PDF, imagem, vídeo, doc ou link.</p>
          </div>
          <button onClick={onClose} className="p-1.5 -mr-1.5 hover:bg-gray-100 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[12px] font-bold px-3 py-2 rounded-xl">{error}</div>}

          {/* Paciente */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Paciente</label>
            <div className="relative">
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl h-[44px] px-3.5 pr-10 text-[14px] font-semibold text-gray-900 outline-none focus:border-blue-500"
              >
                <option value="">Selecione um paciente</option>
                {patients.map((p) => (
                  <option key={p.user_id} value={p.user_id}>{p.name || 'Sem nome'}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Tipo</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['pdf','image','video','doc','link','other'] as MaterialType[]).map((t) => {
                const Icon = ICON_BY_TYPE[t];
                const meta = MATERIAL_TYPE_META[t];
                const active = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                      active ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-blue-500' : 'text-gray-500'}`} strokeWidth={2.5} />
                    <span className={`text-[10px] font-bold ${active ? 'text-blue-500' : 'text-gray-600'}`}>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Guia de hidratação"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl h-[44px] px-3.5 text-[14px] font-semibold text-gray-900 outline-none focus:border-blue-500 placeholder:font-normal placeholder:text-gray-400"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Descrição (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Breve explicação do material"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-gray-900 outline-none focus:border-blue-500 placeholder:font-normal placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Arquivo OU link */}
          {type === 'link' ? (
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">URL</label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl h-[44px] px-3.5 text-[13px] font-medium text-gray-900 outline-none focus:border-blue-500 placeholder:font-normal placeholder:text-gray-400"
              />
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Arquivo</label>
              {file ? (
                <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-blue-600">
                    <FileIcon className="w-4 h-4" />
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
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">Até 50MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" hidden onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancelar</button>
          <button
            onClick={submit}
            disabled={!canSubmit || saving}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enviando...' : 'Enviar para o paciente'}
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
  patient?: any;          // se vier, filtra por esse paciente
  patients?: Patient[];   // lista pra select no upload
  nutritionistId: string | null;
  onBack: () => void;
}

export const MaterialsView: React.FC<Props> = ({ patient, patients = [], nutritionistId, onBack }) => {
  const [items, setItems] = useState<(PatientMaterial & { patient_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | MaterialType>('all');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<PatientMaterial | null>(null);

  const isFilteredByPatient = !!patient?.user_id;
  const targetPatientName = patient?.profiles?.name || 'Paciente';

  const loadAll = async () => {
    setLoading(true);
    try {
      if (isFilteredByPatient) {
        const list = await materialsService.listForPatient(patient.user_id);
        setItems(list);
      } else if (nutritionistId) {
        const list = await materialsService.listAllByNutri(nutritionistId);
        setItems(list);
      }
    } catch (err) {
      console.error('[MaterialsView] load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [patient?.user_id, nutritionistId]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('materials_view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_materials' }, () => loadAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line
  }, []);

  const filtered = useMemo(() => {
    let out = items;
    if (filter !== 'all') out = out.filter((i) => i.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      out = out.filter((i) =>
        i.title.toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q) ||
        (i.patient_name || '').toLowerCase().includes(q)
      );
    }
    return out;
  }, [items, filter, search]);

  const handleOpen = async (m: PatientMaterial) => {
    try {
      const url = await materialsService.getOpenUrl(m);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      alert('Erro ao abrir: ' + (err?.message || 'tente novamente.'));
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await materialsService.remove(confirmDelete);
      setConfirmDelete(null);
      loadAll();
    } catch (err: any) {
      alert('Erro ao excluir: ' + (err?.message || ''));
    }
  };

  const stats = useMemo(() => ({
    total: items.length,
    week: items.filter((i) => Date.now() - new Date(i.created_at).getTime() < 7*24*60*60*1000).length,
    read: items.filter((i) => !!i.read_at).length,
  }), [items]);

  return (
    <div className="fixed inset-0 bg-[#F9FAFC] z-[110] overflow-y-auto font-sans">
      <main className="px-4 lg:px-10 py-8">
        <div className="max-w-[1240px] mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                {isFilteredByPatient && <p className="text-[12px] font-semibold text-gray-500">{targetPatientName}</p>}
                <h1 className="text-[24px] font-extrabold text-gray-900 tracking-tight">Materiais</h1>
              </div>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(59,130,246,0.30)] transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={3} /> Enviar material
            </button>
          </div>

          {/* Stats mini */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { lbl: 'Total enviados', val: stats.total, color: 'text-blue-500 bg-blue-50' },
              { lbl: 'Esta semana', val: stats.week, color: 'text-purple-500 bg-purple-50' },
              { lbl: 'Lidos', val: stats.read, color: 'text-emerald-500 bg-emerald-50' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
                    <FileText className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{s.lbl}</p>
                    <p className="text-[20px] font-extrabold text-gray-900 leading-none">{s.val}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-2xl p-3 border border-gray-100 mb-6 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3 focus-within:border-blue-400">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="flex-1 bg-transparent px-2.5 py-2 text-[13px] font-medium text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
            <div className="flex bg-gray-50 p-1 rounded-xl flex-wrap">
              {(['all','pdf','image','video','doc','link'] as const).map((f) => {
                const lbl = f === 'all' ? 'Todos' : MATERIAL_TYPE_META[f as MaterialType].label;
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

          {/* Grid de materiais */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse h-[140px]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 py-16 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-[15px] font-bold text-gray-700">
                {search || filter !== 'all' ? 'Nenhum resultado' : 'Nenhum material enviado'}
              </p>
              <p className="text-[12px] text-gray-500 mt-1">
                {search || filter !== 'all' ? 'Tente alterar os filtros.' : 'Clique em "Enviar material" pra começar.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((m) => {
                const Icon = ICON_BY_TYPE[m.type];
                const meta = MATERIAL_TYPE_META[m.type];
                return (
                  <div key={m.id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${meta.bg} ${meta.color}`}>
                        <Icon className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md ${meta.bg} ${meta.color} uppercase tracking-wide`}>{meta.label}</span>
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-900 line-clamp-2 mb-1">{m.title}</h3>
                    {m.description && <p className="text-[12px] text-gray-500 line-clamp-2 mb-3">{m.description}</p>}

                    <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400 mb-4">
                      {!isFilteredByPatient && m.patient_name && (
                        <>
                          <span className="truncate">{m.patient_name}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{new Date(m.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                      {m.file_size && (<><span>•</span><span>{formatBytes(m.file_size)}</span></>)}
                      {m.read_at && (
                        <span className="flex items-center gap-1 text-emerald-600 ml-auto">
                          <CheckCircle2 className="w-3 h-3" strokeWidth={3} /> Lido
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpen(m)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-700 text-[12px] font-bold rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Abrir
                      </button>
                      <button
                        onClick={() => setConfirmDelete(m)}
                        className="px-3 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showUpload && (
        <UploadMaterialModal
          patients={isFilteredByPatient ? [{ user_id: patient.user_id, name: targetPatientName }] : patients}
          defaultPatientId={isFilteredByPatient ? patient.user_id : undefined}
          nutritionistId={nutritionistId}
          onClose={() => setShowUpload(false)}
          onSent={() => loadAll()}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[400] bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-[400px] p-6 shadow-2xl">
            <h3 className="text-[16px] font-bold text-gray-900 mb-1">Excluir material?</h3>
            <p className="text-[13px] text-gray-500">Esta ação não pode ser desfeita. O paciente perderá o acesso a "{confirmDelete.title}".</p>
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
