// eBay sold listings via the Browse API
// https://developer.ebay.com/api-docs/buy/browse/overview.html

export async function fetchPrice(cardName, setName) {
  if (!process.env.EBAY_OAUTH_TOKEN) return null;

  const q = encodeURIComponent(`${cardName} ${setName} pokemon card`);
  const res = await fetch(
    `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${q}&filter=buyingOptions:{FIXED_PRICE},conditions:{1000}&sort=endingSoonest&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${process.env.EBAY_OAUTH_TOKEN}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
    }
  );
  if (!res.ok) return null;

  const { itemSummaries } = await res.json();
  if (!itemSummaries?.length) return null;

  const prices = itemSummaries
    .map((i) => parseFloat(i.price?.value))
    .filter((p) => !isNaN(p));

  if (!prices.length) return null;
  return prices.reduce((a, b) => a + b, 0) / prices.length;
}
