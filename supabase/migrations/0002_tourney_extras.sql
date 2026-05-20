-- Add tournament title + re-entries support.
-- Both columns are nullable so existing rows remain valid.

ALTER TABLE chip_stack.sessions
  ADD COLUMN IF NOT EXISTS reentries INTEGER,
  ADD COLUMN IF NOT EXISTS tourney_title TEXT;
