import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { captureReferralFromUrl } from '../utils/referral'
import { trackPageView } from '../analytics'

export default function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    // Scroll to top with smooth animation
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
    // Persist any ?ref= query param so the booking form can auto-fill it later
    captureReferralFromUrl(search)
    // Emit a GA4 page_view on every SPA navigation (no-op until consent granted)
    trackPageView(pathname + search)
  }, [pathname, search])

  return null
}