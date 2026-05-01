-- ============================================================
-- tedsolomon.com — database schema
-- Run once in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/yzgfpteoyyubfmmlixbz/sql
-- ============================================================

-- wins
CREATE TABLE IF NOT EXISTS wins (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  date                date        NOT NULL,
  category            text        NOT NULL,
  visibility          text        NOT NULL,
  description         text        NOT NULL,
  impact_metric_type  text,
  impact_metric_value text,
  tags                text[]      NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- posts
CREATE TABLE IF NOT EXISTS posts (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text        NOT NULL,
  body           text        NOT NULL,
  platform       text        NOT NULL,
  status         text        NOT NULL DEFAULT 'draft',
  scheduled_date timestamptz,
  posted_date    timestamptz,
  pillar         text,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- google_tokens (single-row OAuth token store, keyed by user_id = 'default')
CREATE TABLE IF NOT EXISTS google_tokens (
  user_id       text        PRIMARY KEY,
  access_token  text        NOT NULL,
  refresh_token text,
  expires_at    timestamptz NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- daily_focus
CREATE TABLE IF NOT EXISTS daily_focus (
  date       date        PRIMARY KEY,
  priority_1 text,
  priority_2 text,
  priority_3 text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- one_on_ones
CREATE TABLE IF NOT EXISTS one_on_ones (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name     text        NOT NULL,
  person_role     text,
  date            date        NOT NULL,
  talking_points  text,
  their_feedback  text,
  my_notes        text,
  action_items    text,
  follow_up_date  date,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
