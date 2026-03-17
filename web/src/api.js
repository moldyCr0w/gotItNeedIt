// Temporary: hardcoded user until auth is added
export const USER_ID = '00000000-0000-0000-0000-000000000001';

async function req(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Cards
export const searchCards = (q) => req(`/cards/search?q=${encodeURIComponent(q)}`);
export const getCard = (id) => req(`/cards/${id}`);

// Collection
export const getCollection = () => req(`/collection?userId=${USER_ID}`);
export const addToCollection = (body) => req('/collection', { method: 'POST', body: JSON.stringify({ userId: USER_ID, ...body }) });
export const updateCollectionEntry = (id, body) => req(`/collection/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const removeFromCollection = (id) => req(`/collection/${id}`, { method: 'DELETE' });

// Chase list
export const getChaseEntries = (params = {}) => {
  const qs = new URLSearchParams({ userId: USER_ID, ...params }).toString();
  return req(`/chase?${qs}`);
};
export const addToChase = (body) => req('/chase', { method: 'POST', body: JSON.stringify({ userId: USER_ID, ...body }) });
export const updateChaseEntry = (id, body) => req(`/chase/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const removeFromChase = (id) => req(`/chase/${id}`, { method: 'DELETE' });

export const getFolders = () => req(`/chase/folders?userId=${USER_ID}`);
export const createFolder = (name) => req('/chase/folders', { method: 'POST', body: JSON.stringify({ userId: USER_ID, name }) });
export const deleteFolder = (id) => req(`/chase/folders/${id}`, { method: 'DELETE' });

// Pricing
export const getPricing = (cardId) => req(`/pricing/${cardId}`);
export const refreshPricing = (cardId) => req(`/pricing/${cardId}/refresh`, { method: 'POST' });
