import { useNavigate } from 'react-router';
import RegisterForm from '../../components/auth/RegisterForm';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    // User is automatically logged in after registration
    // Redirect to profile page
    navigate('/profile');
  };

  const handleRegisterError = (error: string) => {
    console.error('Registration error:', error);
    // Error handling is already done in the form component
  };

  return (
    <RegisterForm
      onSuccess={handleRegisterSuccess}
      onError={handleRegisterError}
    />
  );
};
