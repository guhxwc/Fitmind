import { supabase } from '../supabaseClient';
import { LOCAL_FOOD_DATABASE } from './localFoodData';

export interface FoodItem {
  id: number;                // vamos normalizar pra number
  nome: string;
  categoria?: string;
  calorias: number;          // kcal por 100g (base TACO)
  proteinas: number;         // g por 100g
  carboidratos: number;      // g por 100g
  gorduras: number;          // g por 100g
  fibras: number;            // g por 100g
  porcao_gramas?: number;    // opcional (porção do usuário)
}

export interface FattyAcidsItem {
  id_alimento: number;
  saturados: number;
  mono_insaturados: number;
  poli_insaturados: number;
  trans: number; // soma 18:1t + 18:2t quando existir
}

export interface AminoAcidsItem {
  id_alimento: number;
  triptofano: number;
  treonina: number;
  isoleucina: number;
  leucina: number;
  lisina: number;
  metionina: number;
  cistina: number;
  fenilalanina: number;
  tirosina: number;
  valina: number;
  arginina: number;
  histidina: number;
  alanina: number;
  acido_aspartico: number;
  acido_glutamico: number;
  glicina: number;
  prolina: number;
  serina: number;
}

type AlimentosRow = Record<string, any>;

const COLS_ALIMENTOS =
  `"Número do Alimento","Categoria do alimento","Descrição dos alimentos","Energia (kcal)","Proteína (g)","Carboidrato (g)","Lipídeos (g)","Fibra Alimentar (g)"`;

const COLS_GORDURAS =
  `"Número do Alimento","Saturados (g)","Mono-insaturados (g)","Poli-insaturados (g)","18:1t (g)","18:2t (g)"`;

function removeAccents(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalize(str: string) {
  let s = (str || '').toLowerCase();
  s = removeAccents(s);
  s = s.replace(/[.,()\-]/g, ' ');
  s = s.replace(/\b(de|com|sem|em|ao|a|o|as|os|e|tipo)\b/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function toNumberSafe(v: any): number {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'string') {
    v = v.replace(',', '.');
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapAlimentosRowToFoodItem(row: AlimentosRow): FoodItem {
  // Handle both exact string keys and possible snake_case keys from Supabase
  const id = row['Número do Alimento'] ?? row['numero_do_alimento'] ?? row['id'];
  const nome = row['Descrição dos alimentos'] ?? row['descricao_dos_alimentos'] ?? row['nome'];
  const categoria = row['Categoria do alimento'] ?? row['categoria_do_alimento'] ?? row['categoria'];
  const calorias = row['Energia (kcal)'] ?? row['energia_kcal'] ?? row['calorias'];
  const proteinas = row['Proteína (g)'] ?? row['proteina_g'] ?? row['proteinas'];
  const carboidratos = row['Carboidrato (g)'] ?? row['carboidrato_g'] ?? row['carboidratos'];
  const gorduras = row['Lipídeos (g)'] ?? row['lipideos_g'] ?? row['gorduras'];
  const fibras = row['Fibra Alimentar (g)'] ?? row['fibra_alimentar_g'] ?? row['fibras'];

  return {
    id: Number(id),
    nome: formatFoodName(nome),
    categoria: categoria ?? undefined,
    calorias: toNumberSafe(calorias),
    proteinas: toNumberSafe(proteinas),
    carboidratos: toNumberSafe(carboidratos),
    gorduras: toNumberSafe(gorduras),
    fibras: toNumberSafe(fibras),
  };
}

// tenta buscar por ILIKE usando query completa; se falhar, tenta palavras-chave
async function supabaseSearchAlimentos(normalizedQuery: string, limit = 20) {
  const words = normalizedQuery.split(' ').filter(Boolean);
  const attempts: string[] = [];

  if (normalizedQuery.length >= 2) attempts.push(normalizedQuery);
  if (words.length) attempts.push(words[0]);
  if (words.length >= 2) attempts.push(words.slice(0, 2).join(' '));

  // remove duplicados
  const uniqueAttempts = Array.from(new Set(attempts));

  for (const term of uniqueAttempts) {
    const { data, error } = await supabase
      .from('tabela_alimentos')
      .select('*') // Select all to avoid column name mismatch errors
      .ilike('Descrição dos alimentos', `%${term}%`)
      .limit(limit);

    if (!error && data && data.length > 0) return data as any[];
    
    // Try snake_case column name if exact string fails
    const { data: data2, error: error2 } = await supabase
      .from('tabela_alimentos')
      .select('*')
      .ilike('descricao_dos_alimentos', `%${term}%`)
      .limit(limit);
      
    if (!error2 && data2 && data2.length > 0) return data2 as any[];
    
    // Try 'nome' column name
    const { data: data3, error: error3 } = await supabase
      .from('tabela_alimentos')
      .select('*')
      .ilike('nome', `%${term}%`)
      .limit(limit);
      
    if (!error3 && data3 && data3.length > 0) return data3 as any[];
  }
  return [];
}

export const foodDatabaseService = {
  async searchFood(query: string): Promise<FoodItem[]> {
    if (!query) return [];

    const normalizedQuery = normalize(query);
    const queryWords = normalizedQuery.split(' ').filter(Boolean);

    // 1) tenta Supabase
    let rows: any[] = [];
    try {
      rows = await supabaseSearchAlimentos(normalizedQuery, 30);
    } catch (err) {
      console.warn('Supabase search failed, using local fallback:', err);
      rows = [];
    }

    const supaItems = (rows || []).map(mapAlimentosRowToFoodItem);

    // filtra para bater a maioria das palavras (pelo menos 70%)
    const filtered = supaItems.filter((item) => {
      const nameNorm = normalize(item.nome);
      const matchCount = queryWords.filter((w) => nameNorm.includes(w)).length;
      return matchCount / queryWords.length >= 0.7;
    });

    if (filtered.length > 0) {
        // Sort by match count (descending) and then by name length (ascending - prefer shorter, more exact matches)
        return filtered.sort((a, b) => {
            const matchCountA = queryWords.filter((w) => normalize(a.nome).includes(w)).length;
            const matchCountB = queryWords.filter((w) => normalize(b.nome).includes(w)).length;
            if (matchCountA !== matchCountB) return matchCountB - matchCountA;
            return a.nome.length - b.nome.length;
        }).slice(0, 20);
    }

    // 2) fallback local se nada achou
    const localResults = LOCAL_FOOD_DATABASE
      .filter((item) => {
        const nameNorm = normalize(item.nome);
        const matchCount = queryWords.filter((w) => nameNorm.includes(w)).length;
        return matchCount / queryWords.length >= 0.7;
      })
      .sort((a, b) => {
          const matchCountA = queryWords.filter((w) => normalize(a.nome).includes(w)).length;
          const matchCountB = queryWords.filter((w) => normalize(b.nome).includes(w)).length;
          if (matchCountA !== matchCountB) return matchCountB - matchCountA;
          return a.nome.length - b.nome.length;
      })
      .slice(0, 10)
      .map((item) => ({
        ...item,
        nome: formatFoodName(item.nome),
      }));

    return localResults;
  },

  async getFoodById(id: number | string): Promise<FoodItem | null> {
    const foodId = Number(id);

    // Try exact column name first
    let { data, error } = await supabase
      .from('tabela_alimentos')
      .select('*')
      .eq('Número do Alimento', foodId)
      .maybeSingle();

    // If failed, try snake_case column name
    if (error || !data) {
        const res = await supabase
          .from('tabela_alimentos')
          .select('*')
          .eq('numero_do_alimento', foodId)
          .maybeSingle();
        data = res.data;
        error = res.error;
    }
    
    // If failed, try 'id' column name
    if (error || !data) {
        const res = await supabase
          .from('tabela_alimentos')
          .select('*')
          .eq('id', foodId)
          .maybeSingle();
        data = res.data;
        error = res.error;
    }

    if (!error && data) {
      return mapAlimentosRowToFoodItem(data as any);
    }

    const localItem = LOCAL_FOOD_DATABASE.find((item) => Number(item.id) === foodId);
    if (localItem) {
      return { ...localItem, nome: formatFoodName(localItem.nome) };
    }

    return null;
  },

  async getFattyAcidsByFoodId(foodId: number | string): Promise<FattyAcidsItem | null> {
    const id = Number(foodId);

    let { data, error } = await supabase
      .from('tabela_acidos_graxos')
      .select('*')
      .eq('Número do Alimento', id)
      .maybeSingle();
      
    if (error || !data) {
        const res = await supabase
          .from('tabela_acidos_graxos')
          .select('*')
          .eq('numero_do_alimento', id)
          .maybeSingle();
        data = res.data;
        error = res.error;
    }
    
    if (error || !data) {
        const res = await supabase
          .from('tabela_acidos_graxos')
          .select('*')
          .eq('id_alimento', id)
          .maybeSingle();
        data = res.data;
        error = res.error;
    }

    if (error || !data) return null;

    const t1 = toNumberSafe(data['18:1t (g)'] ?? data['18_1t_g'] ?? data['trans_18_1']);
    const t2 = toNumberSafe(data['18:2t (g)'] ?? data['18_2t_g'] ?? data['trans_18_2']);

    return {
      id_alimento: Number(data['Número do Alimento'] ?? data['numero_do_alimento'] ?? data['id_alimento'] ?? id),
      saturados: toNumberSafe(data['Saturados (g)'] ?? data['saturados_g'] ?? data['saturados']),
      mono_insaturados: toNumberSafe(data['Mono-insaturados (g)'] ?? data['mono_insaturados_g'] ?? data['mono_insaturados']),
      poli_insaturados: toNumberSafe(data['Poli-insaturados (g)'] ?? data['poli_insaturados_g'] ?? data['poli_insaturados']),
      trans: t1 + t2,
    };
  },

  async getAminoAcidsByFoodId(foodId: number | string): Promise<AminoAcidsItem | null> {
    const id = Number(foodId);

    // Ajuste as colunas se o seu schema de aminoácidos estiver com nomes diferentes.
    // Se sua tabela aminoacidos estiver com colunas "Triptofano (g)" etc, adapte aqui.
    let { data, error } = await supabase
      .from('tabela_aminoacidos')
      .select('*')
      .eq('Número do Alimento', id)
      .maybeSingle();
      
    if (error || !data) {
        const res = await supabase
          .from('tabela_aminoacidos')
          .select('*')
          .eq('numero_do_alimento', id)
          .maybeSingle();
        data = res.data;
        error = res.error;
    }
    
    if (error || !data) {
        const res = await supabase
          .from('tabela_aminoacidos')
          .select('*')
          .eq('id_alimento', id)
          .maybeSingle();
        data = res.data;
        error = res.error;
    }

    if (error || !data) return null;

    // Caso seu schema já esteja em snake_case (triptofano, treonina etc), ok.
    // Se estiver em colunas com "(g)", você precisa mapear igual fizemos em alimentos.
    return {
      id_alimento: Number(data['Número do Alimento'] ?? data['numero_do_alimento'] ?? data['id_alimento'] ?? id),
      triptofano: toNumberSafe(data.triptofano ?? data['Triptofano (g)']),
      treonina: toNumberSafe(data.treonina ?? data['Treonina (g)']),
      isoleucina: toNumberSafe(data.isoleucina ?? data['Isoleucina (g)']),
      leucina: toNumberSafe(data.leucina ?? data['Leucina (g)']),
      lisina: toNumberSafe(data.lisina ?? data['Lisina (g)']),
      metionina: toNumberSafe(data.metionina ?? data['Metionina (g)']),
      cistina: toNumberSafe(data.cistina ?? data['Cistina (g)']),
      fenilalanina: toNumberSafe(data.fenilalanina ?? data['Fenilalanina (g)']),
      tirosina: toNumberSafe(data.tirosina ?? data['Tirosina (g)']),
      valina: toNumberSafe(data.valina ?? data['Valina (g)']),
      arginina: toNumberSafe(data.arginina ?? data['Arginina (g)']),
      histidina: toNumberSafe(data.histidina ?? data['Histidina (g)']),
      alanina: toNumberSafe(data.alanina ?? data['Alanina (g)']),
      acido_aspartico: toNumberSafe(data.acido_aspartico ?? data['Ácido Aspártico (g)']),
      acido_glutamico: toNumberSafe(data.acido_glutamico ?? data['Ácido Glutâmico (g)']),
      glicina: toNumberSafe(data.glicina ?? data['Glicina (g)']),
      prolina: toNumberSafe(data.prolina ?? data['Prolina (g)']),
      serina: toNumberSafe(data.serina ?? data['Serina (g)']),
    };
  },

  async findBestMatches(terms: string[]): Promise<Record<string, FoodItem | null>> {
    const results: Record<string, FoodItem | null> = {};
    for (const term of terms) {
      const items = await this.searchFood(term);
      results[term] = items.length > 0 ? items[0] : null;
    }
    return results;
  },
};

function formatFoodName(name: string): string {
  if (!name) return '';

  // troca pontos e vírgulas por espaço
  let formatted = name.replace(/[.,]/g, ' ');

  // remove apenas "cru/crua" do nome exibido (não é recomendação)
  formatted = formatted.replace(/\b(cru|crua)\b/gi, '');

  // limpa espaços
  formatted = formatted.replace(/\s+/g, ' ').trim();

  // NÃO forçar tudo pra lower-case (evita quebrar siglas)
  // opcional: só garantir primeira letra maiúscula se estiver tudo minúsculo
  if (formatted === formatted.toLowerCase()) {
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  return formatted;
}
