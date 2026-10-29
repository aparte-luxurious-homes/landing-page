'use client';

import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { BRAND, INK, PAPER } from './ui';

export interface SectionNavItem {
  id: string;
  label: string;
}

/**
 * Sticky jump bar that sits under the site header and highlights the section in
 * view. On a long page of stacked sections this is what lets a thumb get to
 * "Reviews" or "Location" without a mile of scrolling.
 */
const SectionNav: React.FC<{ items: SectionNavItem[] }> = ({ items }) => {
  const [active, setActive] = useState(items[0]?.id);
  const key = items.map((i) => i.id).join('|');

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-25% 0px -65% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Keep the active pill in view inside the scrolling bar.
  useEffect(() => {
    document.getElementById(`nav-${active}`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [active]);

  return (
    <Box
      component="nav"
      aria-label="Page sections"
      sx={{
        position: 'sticky',
        top: { xs: 64, md: 80 },
        zIndex: 1100,
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(25,25,25,0.08)',
      }}
    >
      <Box
        sx={{
          maxWidth: 1536,
          mx: 'auto',
          px: { xs: 2, md: 4 },
          py: 1.25,
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {items.map((item) => {
          const on = item.id === active;
          return (
            <Box
              key={item.id}
              id={`nav-${item.id}`}
              component="button"
              type="button"
              onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              sx={{
                all: 'unset',
                cursor: 'pointer',
                flexShrink: 0,
                px: 2,
                py: 0.9,
                borderRadius: 999,
                fontSize: '0.875rem',
                fontWeight: 600,
                color: on ? '#fff' : INK,
                bgcolor: on ? BRAND : 'transparent',
                border: '1px solid',
                borderColor: on ? BRAND : 'rgba(25,25,25,0.2)',
                transition: 'all .15s',
                WebkitTapHighlightColor: 'transparent',
                '&:focus-visible': { outline: `3px solid ${BRAND}` },
              }}
            >
              {item.label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SectionNav;
