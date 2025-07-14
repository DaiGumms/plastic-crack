import PasswordResetForm from '../../components/auth/PasswordResetForm';

export const ResetPasswordPage = () => {
  const handleResetSuccess = () => {
    // Form component handles the success state internally
    console.log('Password reset email sent successfully');
  };

  const handleResetError = (error: string) => {
    console.error('Password reset error:', error);
    // Error handling is already done in the form component
  };

  return (
    <PasswordResetForm
      onSuccess={handleResetSuccess}
      onError={handleResetError}
    />
  );
};
