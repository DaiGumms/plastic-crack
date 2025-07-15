import { useNavigate, useLocation } from 'react-router';
import LoginForm from '../../components/auth/LoginForm';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSuccess = () => {
    // Check for redirect parameter in URL
    const searchParams = new URLSearchParams(location.search);
    const redirectParam = searchParams.get('redirect');
    
    // Check if there's a redirect location from the route state or URL
    const from = redirectParam || location.state?.from || '/profile';
    console.log('Login successful, redirecting to:', from);
    navigate(from, { replace: true });
  };

  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
    // Error handling is already done in the form component
  };

  return (
    <LoginForm onSuccess={handleLoginSuccess} onError={handleLoginError} />
  );
};
