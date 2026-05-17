-- Tabela para rastrear histórico de streak (dias que o usuário realizou login/atividade)
CREATE TABLE IF NOT EXISTS streak_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, activity_date)
);

ALTER TABLE streak_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own streak history" 
    ON streak_history FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own streak history" 
    ON streak_history FOR SELECT 
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS streak_history_user_date_idx ON streak_history (user_id, activity_date);
