import type { AgentApprovalUserLike } from '../../../utils/agentApproval';

export interface BaseFormProps {
  mode: 'login' | 'signup';
  userType: 'GUEST' | 'OWNER' | 'AGENT';
  onSuccess: (token: string, userRole: string, user?: AgentApprovalUserLike) => void;
  onSwitchMode: () => void;
  setStep: (step: 'form' | 'otp' | 'phoneOtp' | 'profile' | 'profileComplete') => void;
  onPhoneChange?: (phone: string) => void;
  onEmailChange?: (email: string) => void;
} 