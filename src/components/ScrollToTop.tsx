import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { captureReferralFromUrl } from '../utils/referral'

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
  }, [pathname, search])

  return null
}