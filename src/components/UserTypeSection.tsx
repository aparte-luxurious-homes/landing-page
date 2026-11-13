'use client';

import React, { useEffect } from "react";
import { useNavigate, useLocation } from '@/lib/router';
import PageLayout from "./pagelayout/index";

interface UserTypeSectionProps {
  onSelect: (userType: "GUEST" | "OWNER" | "AGENT") => void;
}

const UserTypeSection: React.FC<UserTypeSectionProps> = ({ onSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get existing search params (like redirect)
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect');

  const handleUserTypeClick = (userType: "GUEST" | "OWNER" | "AGENT") => {
    // First call onSelect to update the parent state
    onSelect(userType);
    
    // Build new params
    const newParams = new URLSearchParams();
    newParams.set('type', userType);
    newParams.set('mode', 'signup');
    if (redirect) {
      newParams.set('redirect', redirect);
    }
    
    // Navigate with both type and mode parameters
    navigate(`/signup?${newParams.toString()}`);
  };

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen py-20 px-6 md:pt-40">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          How would you like to sign up?
        </h2>
        <p className="text-gray-600 mb-12 text-center max-w-md">
          Select your account type to get started with Aparte
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {/* Guest Card */}
          <div
            className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-md border-2 border-transparent hover:border-[#028090] hover:shadow-lg cursor-pointer transition-all duration-300 group"
            onClick={() => handleUserTypeClick("GUEST")}
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#028090] transition-colors duration-300">
              <svg className="w-10 h-10 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-[#028090]">
              I'm a Guest
            </span>
            <p className="text-gray-500 text-center text-sm">
              Book stays and manage your reservations
            </p>
          </div>

          {/* Agent Card */}
          <div
            className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-md border-2 border-transparent hover:border-[#028090] hover:shadow-lg cursor-pointer transition-all duration-300 group"
            onClick={() => handleUserTypeClick("AGENT")}
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#028090] transition-colors duration-300">
              <svg className="w-10 h-10 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-[#028090]">
              I'm an Agent
            </span>
            <p className="text-gray-500 text-center text-sm">
              Manage properties and client bookings
            </p>
          </div>

          {/* Owner Card */}
          <div
            className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-md border-2 border-transparent hover:border-[#028090] hover:shadow-lg cursor-pointer transition-all duration-300 group"
            onClick={() => handleUserTypeClick("OWNER")}
          >
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#028090] transition-colors duration-300">
              <svg className="w-10 h-10 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-[#028090]">
              I'm a Home Owner
            </span>
            <p className="text-gray-500 text-center text-sm">
              List and manage your properties
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default UserTypeSection;