import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';
import { isAsistente } from '../utils/roleUtils';

const AsistenteRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!isAsistente(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AsistenteRoute;
