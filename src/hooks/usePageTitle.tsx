'use client';

import { useEffect } from 'react';

interface UsePageTitleProps {
  title: string;
  suffix?: boolean;
}

/**
 * Client-side document.title updater for transactional (noindexed) routes
 * whose title changes with client state — payment pending/success and booking
 * confirmation. Indexable routes set titles via Next `metadata` instead.
 *
 * Replaces the react-helmet-async version: with every SEO-relevant route on
 * server metadata, a head-management library for three tab titles wasn't
 * carrying its weight.
 */
const usePageTitle = ({ title, suffix = true }: UsePageTitleProps) => {
  useEffect(() => {
    const baseTitle = 'AparteNG';
    document.title = suffix ? `${title} | ${baseTitle}` : title;
  }, [title, suffix]);

  // Callers historically rendered the return value ({titleComponent}); keep
  // the shape but there is nothing to render any more.
  return null;
};

export default usePageTitle;
