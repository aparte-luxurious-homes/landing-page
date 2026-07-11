import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

interface AdminRedirectProps {
    /**
     * Path inside the admin dashboard to land on after the login handoff,
     * e.g. "/property-management/create". Omit to send users to the
     * dashboard's default post-login destination.
     */
    redirect?: string;
    /** Headline shown while the browser navigates away. */
    title?: string;
    /** Sub-text shown under the headline. */
    subtitle?: string;
}

/**
 * Client-side redirect to the Aparte admin dashboard. Authenticated
 * OWNER/AGENT users are deep-linked to the admin login with their token in
 * the URL (existing cross-app handoff pattern); everyone else is sent to the
 * plain admin login page. Used by `/list`, `/list-your-property` and `/agent`.
 */
export default function AdminRedirect({
    redirect,
    title = 'Redirecting to the Aparte admin dashboard…',
    subtitle,
}: AdminRedirectProps) {
    const token = useSelector((s: RootState) => s.root.auth.token);
    const adminUrl = import.meta.env.VITE_ADMIN_DASHBOARD_URL;

    useEffect(() => {
        if (!adminUrl) {
            console.error('Admin dashboard URL not configured');
            return;
        }
        const params = new URLSearchParams();
        if (token) params.set('token', token);
        if (redirect) params.set('redirect', redirect);
        const query = params.toString();
        window.location.replace(`${adminUrl}/auth/login${query ? `?${query}` : ''}`);
    }, [token, adminUrl, redirect]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-zinc-700">{title}</p>
                {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
            </div>
        </div>
    );
}
