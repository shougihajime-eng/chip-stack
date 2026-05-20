-- Initial schema for chip-stack (Casino Ledger) cloud sync.
-- Tables live in the chip_stack schema; each project must keep to its own schema.

CREATE SCHEMA IF NOT EXISTS chip_stack;

-- ============================================================
-- sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS chip_stack.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  play_date DATE NOT NULL,
  game TEXT NOT NULL,
  format TEXT NOT NULL,
  country TEXT NOT NULL,
  venue TEXT NOT NULL,
  currency TEXT NOT NULL,
  buy_in NUMERIC(14, 4) NOT NULL,
  cash_out NUMERIC(14, 4) NOT NULL,
  fx_rate NUMERIC(14, 6) NOT NULL,
  pnl_local NUMERIC(14, 4) NOT NULL,
  pnl_jpy BIGINT NOT NULL,
  duration_minutes INTEGER,
  tourney_place INTEGER,
  tourney_entrants INTEGER,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_user_play_date_idx
  ON chip_stack.sessions(user_id, play_date DESC);
CREATE INDEX IF NOT EXISTS sessions_user_updated_at_idx
  ON chip_stack.sessions(user_id, updated_at DESC);

ALTER TABLE chip_stack.sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sessions_select_own" ON chip_stack.sessions;
CREATE POLICY "sessions_select_own"
  ON chip_stack.sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "sessions_insert_own" ON chip_stack.sessions;
CREATE POLICY "sessions_insert_own"
  ON chip_stack.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sessions_update_own" ON chip_stack.sessions;
CREATE POLICY "sessions_update_own"
  ON chip_stack.sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sessions_delete_own" ON chip_stack.sessions;
CREATE POLICY "sessions_delete_own"
  ON chip_stack.sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- venues
-- ============================================================
CREATE TABLE IF NOT EXISTS chip_stack.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country TEXT NOT NULL,
  name TEXT NOT NULL,
  favorite SMALLINT NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, country, name)
);

ALTER TABLE chip_stack.venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "venues_all_own" ON chip_stack.venues;
CREATE POLICY "venues_all_own"
  ON chip_stack.venues FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- helpers — keep updated_at fresh on row updates
-- ============================================================
CREATE OR REPLACE FUNCTION chip_stack.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sessions_touch_updated_at ON chip_stack.sessions;
CREATE TRIGGER sessions_touch_updated_at
  BEFORE UPDATE ON chip_stack.sessions
  FOR EACH ROW EXECUTE FUNCTION chip_stack.touch_updated_at();

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA chip_stack TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA chip_stack TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA chip_stack TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA chip_stack TO authenticated;
