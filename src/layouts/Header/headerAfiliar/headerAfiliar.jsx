import { useNavigate } from 'react-router-dom';
import { isAsistente } from '../../../utils/roleUtils';
import headerStyles from './headerAfilliar.module.css';
import notificationsIcon from '../../../assets/notifications.png';
import logoIcon from '../../../assets/evento-remove.png';

const HeaderAfiliar = ({ isMenuCollapsed }) => { 
  const navigate = useNavigate();

  let user = null;
  const raw = localStorage.getItem('user');
  if (raw) user = JSON.parse(raw);

  const email = (user?.email || user?.correo || user?.username || '')?.toString();

  let displayRole = 'Invitado';
  if (isAsistente(user)) displayRole = 'Asistente';

  const nameSource = (email).toString();
  const initials = nameSource
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(s => s[0].toUpperCase())
    .join('') || 'U';

  const handleLogoClick = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className={`${headerStyles.header} ${isMenuCollapsed ? headerStyles.menuCollapsed : ''}`}>
      <div className={headerStyles.left}>
        <button
          className={headerStyles.logoButton}
          onClick={handleLogoClick}
          type="button"
          title="Cerrar sesión"
        >
          <img className={headerStyles.logoImg} src={logoIcon} alt="Evento" />
        </button>
      </div>

      <div className={headerStyles.right}>
        <img className={headerStyles.logoBox} src={notificationsIcon} alt="Notificaciones" />

        <div className={headerStyles.userInfo}>
          <div className={headerStyles.role}>{displayRole}</div>
          <div className={headerStyles.email}>{email || '—'}</div>
        </div>

        <div className={headerStyles.avatar} title={email || 'Usuario'}>{initials}</div>
      </div>
    </header>
  );
};

export default HeaderAfiliar;