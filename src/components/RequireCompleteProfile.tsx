'use client';

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from '@/lib/router';
import { useAppSelector } from '../hooks';
import { useGetProfileQuery } from '../api/profileApi';

const SKIP_PATHS = [
    '/complete-profile',
    '/login',
    '/signup',
    '/auth',
    '/otp',
];

/**
 * Redirects authenticated users with an incomplete profile to /complete-profile.
 * Backend exposes `is_profile_complete` + `missing_profile_fields` on GET /profile.
 * Wraps the route tree so Google-signup users (and anyone landing without
 * phone/dob/gender) are forced through the completion screen before doing anything.
 */
const RequireCompleteProfile: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useAppSelector((state) => state.root.auth);
    const isAuthenticated = !!(auth?.isAuthenticated && auth?.token);
    const location = useLocation();
    const navigate = useNavigate();

    const { data: profileResp } = useGetProfileQuery(undefined, {
        skip: !isAuthenticated,
    });

    const profile = profileResp?.data;
    const isComplete = profile?.isProfileComplete ?? profile?.is_profile_complete;
    const needsCompletion = isAuthenticated && profile != null && isComplete === false;
    const onSkippedPath = SKIP_PATHS.some((p) => location.pathname.startsWith(p));

    useEffect(() => {
        if (needsCompletion && !onSkippedPath) {
            const next = encodeURIComponent(location.pathname + location.search);
            navigate(`/complete-profile?next=${next}`, { replace: true });
        }
    }, [needsCompletion, onSkippedPath, location.pathname, location.search, navigate]);

    return <>{children}</>;
};

export default RequireCompleteProfile;
