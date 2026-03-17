-- 001_initial_schema.sql

-- Users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  username    TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cards (sourced from PokéTCG API, cached locally)
CREATE TABLE cards (
  id          TEXT PRIMARY KEY,  -- PokéTCG API id (e.g. "xy1-1")
  name        TEXT NOT NULL,
  set_id      TEXT NOT NULL,
  set_name    TEXT NOT NULL,
  number      TEXT NOT NULL,     -- card number within set
  rarity      TEXT,
  image_small TEXT,
  image_large TEXT,
  synced_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collection (Got It)
CREATE TABLE collection_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id     TEXT NOT NULL REFERENCES cards(id),
  quantity    INT NOT NULL DEFAULT 1,
  condition   TEXT,              -- NM, LP, MP, HP, DMG
  is_graded   BOOLEAN NOT NULL DEFAULT FALSE,
  grade       NUMERIC(3,1),      -- e.g. 9.5
  grader      TEXT,              -- PSA, BGS, CGC
  notes       TEXT,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chase List Folders
CREATE TABLE chase_folders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chase List (Want It / Need It)
CREATE TABLE chase_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id     TEXT NOT NULL REFERENCES cards(id),
  folder_id   UUID REFERENCES chase_folders(id) ON DELETE SET NULL,
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('grail', 'high', 'medium', 'low')),
  notes       TEXT,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Binders
CREATE TABLE binders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Binder Pages
CREATE TABLE binder_pages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  binder_id    UUID NOT NULL REFERENCES binders(id) ON DELETE CASCADE,
  page_number  INT NOT NULL,
  pocket_layout TEXT NOT NULL DEFAULT '3x3',  -- e.g. "3x3", "4x4", "2x2"
  UNIQUE (binder_id, page_number)
);

-- Binder Slots (card placed in a specific pocket)
CREATE TABLE binder_slots (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id               UUID NOT NULL REFERENCES binder_pages(id) ON DELETE CASCADE,
  slot_index            INT NOT NULL,   -- 0-based position within the page layout
  collection_entry_id   UUID REFERENCES collection_entries(id) ON DELETE SET NULL,
  UNIQUE (page_id, slot_index)
);

-- Boxes
CREATE TABLE boxes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Box Dividers
CREATE TABLE box_dividers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id      UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
  label       TEXT,
  sort_order  INT NOT NULL DEFAULT 0
);

-- Box Rows (cards stored in a row within a divider section)
CREATE TABLE box_rows (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id                UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
  divider_id            UUID REFERENCES box_dividers(id) ON DELETE SET NULL,
  collection_entry_id   UUID NOT NULL REFERENCES collection_entries(id) ON DELETE CASCADE,
  sort_order            INT NOT NULL DEFAULT 0
);

-- Pricing Snapshots
CREATE TABLE pricing_snapshots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     TEXT NOT NULL REFERENCES cards(id),
  source      TEXT NOT NULL CHECK (source IN ('tcgplayer', 'ebay_sold', 'pricecharting')),
  price       NUMERIC(10,2) NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'USD',
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON pricing_snapshots (card_id, source, captured_at DESC);
CREATE INDEX ON collection_entries (user_id);
CREATE INDEX ON chase_entries (user_id);
CREATE INDEX ON chase_entries (folder_id);
