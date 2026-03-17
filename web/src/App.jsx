import { Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Collection from './pages/Collection.jsx';
import Chase from './pages/Chase.jsx';
import Pricing from './pages/Pricing.jsx';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.app}>
      <Nav />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Navigate to="/collection" replace />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/chase" element={<Chase />} />
          <Route path="/pricing/:cardId" element={<Pricing />} />
        </Routes>
      </main>
    </div>
  );
}
