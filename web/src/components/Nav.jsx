import { NavLink } from 'react-router-dom';
import styles from './Nav.module.css';

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <span className={styles.logo}>Collectr+</span>
      <div className={styles.links}>
        <NavLink to="/collection" className={({ isActive }) => isActive ? styles.active : ''}>
          Got It
        </NavLink>
        <NavLink to="/chase" className={({ isActive }) => isActive ? styles.active : ''}>
          Want It / Need It
        </NavLink>
      </div>
    </nav>
  );
}
