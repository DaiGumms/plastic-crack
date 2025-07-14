import { useNavigate } from 'react-router';
import LoginForm from '../../components/auth/LoginForm';

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // Redirect to profile page
    navigate('/profile');
  };

  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
    // Error handling is already done in the form component
  };

  return (
    <LoginForm onSuccess={handleLoginSuccess} onError={handleLoginError} />
  );
};
