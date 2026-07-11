import AdminRedirect from './AdminRedirect';

/**
 * The listing wizard has moved to the admin dashboard. `/list` (and the
 * marketing alias `/list-your-property`) now send users there — deep-linking
 * OWNER/AGENT users straight to the create-property page.
 */
export default function ListRedirect() {
    return (
        <AdminRedirect
            redirect="/property-management/create"
            subtitle="Property listings are now managed there."
        />
    );
}
