'use client';

import React from 'react';

import UserTypeSection from './UserTypeSection';

/**
 * Route component for /auth/user-type.
 *
 * Previously defined inline in App.tsx as a wrapper that passed a no-op
 * onSelect — UserTypeSection handles its own navigation, so the callback
 * only exists to satisfy the prop.
 */
const UserTypeSelection: React.FC = () => {
  return <UserTypeSection onSelect={() => {}} />;
};

export default UserTypeSelection;
