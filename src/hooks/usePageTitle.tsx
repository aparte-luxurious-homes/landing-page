import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface UsePageTitleProps {
  title: string;
  suffix?: boolean;
}

const usePageTitle = ({ title, suffix = true }: UsePageTitleProps) => {
  const baseTitle = 'AparteNG';
  const fullTitle = suffix ? `${title} | ${baseTitle}` : title;

  return (
    <Helmet>
      <title>{fullTitle}</title>
    </Helmet>
  );
};

export default usePageTitle; 