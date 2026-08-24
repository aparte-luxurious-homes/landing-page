import React from 'react';
import { Alert, Box, Chip, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { ConstraintReport } from '../../types/search';

interface InterpretedChipsProps {
  applied: ConstraintReport[];
  relaxed: ConstraintReport[];
  message: string;
  /** Called with the constraint `kind` when a chip is deleted. */
  onRemove: (kind: string) => void;
  query?: string;
}

/**
 * Shows how the search understood the guest's query, as removable chips.
 *
 * Two jobs. First, make the interpretation legible — if we read "under 150k"
 * out of a sentence, the guest should see that and be able to disagree.
 * Second, be honest about relaxation: when nothing matched and we widened
 * something, that chip says so rather than quietly presenting near-misses as
 * exact hits.
 */
const InterpretedChips: React.FC<InterpretedChipsProps> = ({
  applied,
  relaxed,
  message,
  onRemove,
  query,
}) => {
  const visible = applied.filter((chip) => chip.status !== 'dropped');
  const hasRelaxed = relaxed.length > 0;

  if (!visible.length && !message) return null;

  return (
    <Box sx={{ mb: 3 }}>
      {hasRelaxed && message && (
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon fontSize="inherit" />}
          sx={{ mb: 2, alignItems: 'center' }}
        >
          {message}
        </Alert>
      )}

      {visible.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          {query && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mr: 0.5, whiteSpace: 'nowrap' }}
            >
              Searching for:
            </Typography>
          )}

          {visible.map((chip) => {
            const isRelaxed = chip.status === 'relaxed';
            // A scored_only chip is a preference, not a filter — it ranks
            // results rather than excluding any, so it reads lighter.
            const isPreference = Boolean(chip.scored_only);

            const label = (
              <Chip
                label={chip.label}
                size="small"
                onDelete={() => onRemove(chip.kind)}
                variant={isRelaxed || isPreference ? 'outlined' : 'filled'}
                color={isRelaxed ? 'warning' : 'default'}
                sx={{
                  fontWeight: isPreference ? 400 : 500,
                  ...(isPreference && !isRelaxed
                    ? { borderStyle: 'dashed', color: 'text.secondary' }
                    : {}),
                }}
              />
            );

            return isRelaxed && chip.reason ? (
              <Tooltip key={chip.kind} title={chip.reason} arrow>
                <span>{label}</span>
              </Tooltip>
            ) : (
              <React.Fragment key={chip.kind}>{label}</React.Fragment>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default InterpretedChips;
