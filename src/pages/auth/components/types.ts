export interface BaseFormProps {
  mode: 'login' | 'signup';
  userType: 'GUEST' | 'OWNER' | 'AGENT';
  onSuccess: (userId: string, token: string, userRole: string) => void;
  onSwitchMode: () => void;
  setStep: (step: 'form' | 'otp') => void;
  onPhoneChange?: (phone: string) => void;
  onEmailChange?: (email: string) => void;
} 