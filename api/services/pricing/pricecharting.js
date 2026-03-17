// PriceCharting — scrape-friendly public API
// https://www.pricecharting.com/api/products

export async function fetchPrice(cardName, setName) {
  if (!process.env.PRICECHARTING_API_TOKEN) return null;

  const q = encodeURIComponent(`${cardName} ${setName}`);
  const res = await fetch(
    `https://www.pricecharting.com/api/products?q=${q}&status=used&id=pokemon`,
    { headers: { Authorization: `Token ${process.env.PRICECHARTING_API_TOKEN}` } }
  );
  if (!res.ok) return null;

  const { products } = await res.json();
  if (!products?.length) return null;

  // Price is returned in cents
  const cents = products[0]['used-price'];
  return cents != null ? cents / 100 : null;
}
