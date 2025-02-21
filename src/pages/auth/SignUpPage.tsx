import React from 'react';
import { useLocation } from 'react-router-dom';
import AuthPage from './AuthPage';
import UserTypeSection from '../../components/UserTypeSection';
import PageLayout from '../../components/pagelayout';

const SignUpPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hasUserType = searchParams.get('type');

  if (!hasUserType) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen pt-12 md:pt-40">
          <UserTypeSection 
            onSelect={(type) => {
              window.location.href = `/signup?type=${type}`;
            }} 
          />
        </div>
      </PageLayout>
    );
  }

  return <AuthPage mode="signup" />;
};

export default SignUpPage;