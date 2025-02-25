import { store } from '../app/store';

export const redirectToAdminDashboard = () => {
  const state = store.getState();
  const token = state.root.auth.token;
  const adminUrl = import.meta.env.VITE_ADMIN_DASHBOARD_URL;
  
  if (!adminUrl) {
    console.error('Admin dashboard URL not configured');
    return;
  }

  window.location.href = `${adminUrl}/auth/login?token=${token}`;
//   if (userRole === 'OWNER') {
//     // Redirect to list property flow
//     window.location.href = '/list';
//   } else if (userRole === 'AGENT') {
    // Redirect directly to admin dashboard
    // window.location.href = `${adminUrl}/login?token=${token}`;
//   }
}; 