// TCGPlayer pricing — requires a bearer token obtained via their API
// https://docs.tcgplayer.com/

export async function fetchPrice(cardName, setName) {
  if (!process.env.TCGPLAYER_BEARER_TOKEN) return null;

  const query = encodeURIComponent(`${cardName} ${setName}`);
  const res = await fetch(
    `https://api.tcgplayer.com/v1.39.0/catalog/products?productName=${query}&categoryId=3&limit=1`,
    { headers: { Authorization: `Bearer ${process.env.TCGPLAYER_BEARER_TOKEN}` } }
  );
  if (!res.ok) return null;

  const { results } = await res.json();
  if (!results?.length) return null;

  const productId = results[0].productId;
  const priceRes = await fetch(
    `https://api.tcgplayer.com/v1.39.0/pricing/product/${productId}`,
    { headers: { Authorization: `Bearer ${process.env.TCGPLAYER_BEARER_TOKEN}` } }
  );
  if (!priceRes.ok) return null;

  const { results: prices } = await priceRes.json();
  const normal = prices.find((p) => p.subTypeName === 'Normal');
  return normal?.marketPrice ?? null;
}
