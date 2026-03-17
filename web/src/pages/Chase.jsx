import { useState, useEffect } from 'react';
import { getChaseEntries, addToChase, removeFromChase, updateChaseEntry, getFolders, createFolder } from '../api.js';
import CardSearch from '../components/CardSearch.jsx';
import styles from './Chase.module.css';

const PRIORITIES = ['grail', 'high', 'medium', 'low'];

const PRIORITY_COLORS = {
  grail: '#f0b429',
  high: '#e05c6a',
  medium: '#7c6af7',
  low: '#4caf82',
};

export default function Chase() {
  const [entries, setEntries] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [activePriority, setActivePriority] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getChaseEntries(),
      getFolders(),
    ]).then(([e, f]) => { setEntries(e); setFolders(f); }).finally(() => setLoading(false));
  }, []);

  async function handleAdd(card) {
    const entry = await addToChase({
      cardId: card.id,
      folderId: activeFolderId || undefined,
      priority: activePriority || 'medium',
    });
    setEntries((prev) => [...prev, { ...entry, name: card.name, set_name: card.set_name, number: card.number, image_small: card.image_small }]);
  }

  async function handleRemove(id) {
    await removeFromChase(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  async function handlePriorityChange(id, priority) {
    await updateChaseEntry(id, { priority });
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, priority } : e));
  }

  async function handleAddFolder(e) {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const folder = await createFolder(newFolderName.trim());
    setFolders((prev) => [...prev, folder]);
    setNewFolderName('');
  }

  const filtered = entries.filter((e) => {
    if (activeFolderId && e.folder_id !== activeFolderId) return false;
    if (activePriority && e.priority !== activePriority) return false;
    return true;
  });

  if (loading) return <div className={styles.empty}>Loading...</div>;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sideSection}>
          <div className={styles.sideLabel}>Priority</div>
          <button
            className={`${styles.filterBtn} ${!activePriority ? styles.active : ''}`}
            onClick={() => setActivePriority(null)}
          >
            All
          </button>
          {PRIORITIES.map((p) => (
            <button
              key={p}
              className={`${styles.filterBtn} ${activePriority === p ? styles.active : ''}`}
              onClick={() => setActivePriority(p === activePriority ? null : p)}
              style={{ '--dot': PRIORITY_COLORS[p] }}
            >
              <span className={styles.dot} />
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.sideSection}>
          <div className={styles.sideLabel}>Folders</div>
          <button
            className={`${styles.filterBtn} ${!activeFolderId ? styles.active : ''}`}
            onClick={() => setActiveFolderId(null)}
          >
            All
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              className={`${styles.filterBtn} ${activeFolderId === f.id ? styles.active : ''}`}
              onClick={() => setActiveFolderId(f.id === activeFolderId ? null : f.id)}
            >
              {f.name}
            </button>
          ))}
          <form onSubmit={handleAddFolder} className={styles.newFolder}>
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder..."
            />
          </form>
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.header}>
          <h1>Want It / Need It <span className={styles.count}>{filtered.length}</span></h1>
          <CardSearch onSelect={handleAdd} label="Add to Chase List" />
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>Nothing here. Start your chase list!</div>
        ) : (
          <div className={styles.list}>
            {filtered.map((entry) => (
              <div key={entry.id} className={styles.row}>
                {entry.image_small && (
                  <img src={entry.image_small} alt={entry.name} className={styles.thumb} />
                )}
                <div className={styles.info}>
                  <div className={styles.name}>{entry.name}</div>
                  <div className={styles.set}>{entry.set_name} · #{entry.number}</div>
                </div>
                <select
                  value={entry.priority}
                  onChange={(e) => handlePriorityChange(entry.id, e.target.value)}
                  className={styles.prioritySelect}
                  style={{ color: PRIORITY_COLORS[entry.priority] }}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
                <button className={styles.remove} onClick={() => handleRemove(entry.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
