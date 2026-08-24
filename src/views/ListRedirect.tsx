'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

/**
 * The listing wizard has moved to the admin dashboard. `/list` now sends users
 * there. Authenticated OWNER/AGENT users get deep-linked to the create-property
 * page with their token in the URL (existing handoff pattern); everyone else
 * is sent to the admin login page.
 */
export default function ListRedirect() {
    const token = useSelector((s: RootState) => s.root.auth.token);
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL;

    useEffect(() => {
        if (!adminUrl) {
            console.error('Admin dashboard URL not configured');
            return;
        }
        const destination = token
            ? `${adminUrl}/auth/login?token=${token}&redirect=/property-management/create`
            : `${adminUrl}/auth/login?redirect=/property-management/create`;
        window.location.replace(destination);
    }, [token, adminUrl]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-zinc-700">Redirecting to the Aparte admin dashboard…</p>
                <p className="text-xs text-zinc-500">Property listings are now managed there.</p>
            </div>
        </div>
    );
}
