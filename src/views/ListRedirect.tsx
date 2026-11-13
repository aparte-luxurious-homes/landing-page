'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { AGENT_KYC_PATH } from '../utils/agentAuthRedirect';

/**
 * The listing wizard has moved to the admin dashboard. `/list` now sends users
 * there — except unapproved agents, who must complete KYC on the landing site
 * before they can access the dashboard.
 */
export default function ListRedirect() {
    const token = useSelector((s: RootState) => s.root.auth.token);
    const role = useSelector((s: RootState) => s.root.auth.userRole);
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL;

    useEffect(() => {
        if (role === 'AGENT') {
            window.location.replace(AGENT_KYC_PATH);
            return;
        }

        if (!adminUrl) {
            console.error('Admin dashboard URL not configured');
            return;
        }
        const destination = token
            ? `${adminUrl}/auth/login?token=${token}&redirect=/property-management/create`
            : `${adminUrl}/auth/login?redirect=/property-management/create`;
        window.location.replace(destination);
    }, [token, adminUrl, role]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-zinc-700">
                    {role === 'AGENT'
                        ? 'Redirecting to agent KYC…'
                        : 'Redirecting to the Aparte admin dashboard…'}
                </p>
                <p className="text-xs text-zinc-500">
                    {role === 'AGENT'
                        ? 'Complete KYC before accessing the agent dashboard.'
                        : 'Property listings are now managed there.'}
                </p>
            </div>
        </div>
    );
}
