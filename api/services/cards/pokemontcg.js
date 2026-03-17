import db from '../../db.js';

const BASE_URL = 'https://api.pokemontcg.io/v2';

function headers() {
  return process.env.POKETCG_API_KEY
    ? { 'X-Api-Key': process.env.POKETCG_API_KEY }
    : {};
}

function toRow(card) {
  return {
    id: card.id,
    name: card.name,
    set_id: card.set.id,
    set_name: card.set.name,
    number: card.number,
    rarity: card.rarity ?? null,
    image_small: card.images?.small ?? null,
    image_large: card.images?.large ?? null,
  };
}

async function upsertCard(card) {
  const row = toRow(card);
  await db.query(
    `INSERT INTO cards (id, name, set_id, set_name, number, rarity, image_small, image_large, synced_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
     ON CONFLICT (id) DO UPDATE SET
       name=EXCLUDED.name, set_id=EXCLUDED.set_id, set_name=EXCLUDED.set_name,
       number=EXCLUDED.number, rarity=EXCLUDED.rarity,
       image_small=EXCLUDED.image_small, image_large=EXCLUDED.image_large,
       synced_at=NOW()`,
    [row.id, row.name, row.set_id, row.set_name, row.number, row.rarity, row.image_small, row.image_large]
  );
  return row;
}

export async function searchCards(q) {
  const res = await fetch(`${BASE_URL}/cards?q=name:"${encodeURIComponent(q)}"&pageSize=20`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`PokéTCG error: ${res.status}`);
  const { data } = await res.json();
  return Promise.all(data.map(upsertCard));
}

export async function getCard(id) {
  // Check local cache first
  const { rows } = await db.query('SELECT * FROM cards WHERE id = $1', [id]);
  if (rows.length) return rows[0];

  // Fetch from API
  const res = await fetch(`${BASE_URL}/cards/${id}`, { headers: headers() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`PokéTCG error: ${res.status}`);
  const { data } = await res.json();
  return upsertCard(data);
}
