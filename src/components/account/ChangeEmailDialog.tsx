'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import EmailSuggestion from '../inputs/EmailSuggestion';
import { useEmailHint } from '../../hooks/useEmailHint';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setEmail as setAuthEmail } from '../../features/auth/authSlice';
import {
  useCancelEmailChangeMutation,
  useConfirmEmailChangeMutation,
  useRequestEmailChangeMutation,
} from '../../api/profileApi';
import { isPlausibleEmail, normaliseEmail } from '../../lib/email-check';
import { describeEmailChangeError } from '../../lib/email-health';

const CODE_LENGTH = 6;
/** When the API's own wait isn't known (a 429, or reopening a pending change). */
const FALLBACK_WAIT_SECONDS = 60;

type Step = 'enter' | 'code' | 'done';

export interface ChangeEmailDialogProps {
  open: boolean;
  onClose: () => void;
  /** The address on the account now (null for a phone-only account). */
  currentEmail: string | null | undefined;
  /** Prefill for the new-address box: a suggested correction, or the current address to fix. */
  initialEmail?: string | null;
  /**
   * An address already waiting for its code (pending_email on GET /profile).
   * Without an initialEmail the dialog opens straight on the code step for it.
   */
  pendingEmail?: string | null;
}

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#028090', borderWidth: 2 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#028090' },
};

const PRIMARY_SX = {
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: '12px',
  backgroundColor: '#028090',
  '&:hover': { backgroundColor: '#026d7a' },
} as const;

const QUIET_SX = { textTransform: 'none', color: '#555', fontWeight: 500 } as const;

const LINK_SX = {
  textTransform: 'none',
  fontWeight: 600,
  color: '#028090',
  px: 0.5,
  minWidth: 0,
} as const;

function formatWait(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Self-service email change, verified: the new address only replaces the old
 * one once the person types the 6-digit code we sent to it.
 *
 * An unverified change let a hijacked session move the account to an
 * attacker's address and reset the password from there, and let a typo be
 * "fixed" with another typo. Proving the new address receives mail closes
 * both — and is exactly what the email-health banner needs to clear.
 *
 * Steps: new address (with the did-you-mean hint) → code → "your email is now …".
 * Closing the dialog on the code step keeps the change pending (the profile
 * shows it, with "Enter code"); only Cancel withdraws it.
 */
export default function ChangeEmailDialog({
  open,
  onClose,
  currentEmail,
  initialEmail,
  pendingEmail,
}: ChangeEmailDialogProps) {
  const dispatch = useAppDispatch();
  const authEmail = useAppSelector((state) => state.root.auth?.email);
  const [requestChange, { isLoading: sending }] = useRequestEmailChangeMutation();
  const [confirmChange, { isLoading: confirming }] = useConfirmEmailChangeMutation();
  const [cancelChange, { isLoading: cancelling }] = useCancelEmailChangeMutation();
  const busy = sending || confirming || cancelling;

  const [step, setStep] = useState<Step>('enter');
  const [address, setAddress] = useState('');
  /** The address the code was sent to. */
  const [target, setTarget] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [result, setResult] = useState<{ email: string; resent: number } | null>(null);
  const codeRef = useRef<HTMLInputElement | null>(null);

  const emailHint = useEmailHint(address, setAddress);

  // Fresh state on every open.
  useEffect(() => {
    if (!open) return;
    const resume = !initialEmail && !!pendingEmail;
    setStep(resume ? 'code' : 'enter');
    setAddress(initialEmail ?? pendingEmail ?? '');
    setTarget(pendingEmail ?? '');
    setCode('');
    setError(null);
    setExpiresAt(null);
    // Reopening a pending change: we don't know when its code went out, so
    // let them ask now — the API answers 429 if it's too soon.
    setResendAt(null);
    setResult(null);
    // Only on open; prop changes while open (a refetch) mustn't reset the step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Resend countdown.
  const waitSeconds = resendAt ? Math.max(0, Math.ceil((resendAt - now) / 1000)) : 0;
  useEffect(() => {
    if (!open || step !== 'code' || waitSeconds <= 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [open, step, waitSeconds]);

  useEffect(() => {
    if (step === 'code') codeRef.current?.focus();
  }, [step]);

  const sendCode = async (to: string) => {
    setError(null);
    try {
      const res = await requestChange({ email: to }).unwrap();
      setTarget(res.pendingEmail || to);
      setExpiresAt(res.expiresAt);
      setNow(Date.now());
      setResendAt(Date.now() + res.resendAfterSeconds * 1000);
      setCode('');
      setStep('code');
    } catch (err) {
      const status = (err as { status?: unknown })?.status;
      if (status === 429) {
        setNow(Date.now());
        setResendAt(Date.now() + FALLBACK_WAIT_SECONDS * 1000);
      }
      setError(describeEmailChangeError(err, 'request').message);
    }
  };

  const onSubmitAddress = (e: FormEvent) => {
    e.preventDefault();
    // The dialog is portalled, but React still bubbles submit to whatever form renders it.
    e.stopPropagation();
    const next = address.trim();
    if (!isPlausibleEmail(next)) {
      setError('Enter a valid email address.');
      return;
    }
    if (currentEmail && normaliseEmail(next) === normaliseEmail(currentEmail)) {
      setError("That's already the email on your account.");
      return;
    }
    void sendCode(next);
  };

  const submitCode = async (value: string) => {
    if (value.length !== CODE_LENGTH || confirming) return;
    setError(null);
    try {
      const res = await confirmChange({ code: value }).unwrap();
      const email = res.email || target;
      // Keep the remembered sign-in address in step with the account.
      if (authEmail) dispatch(setAuthEmail(email));
      setResult({ email, resent: res.resent });
      setStep('done');
    } catch (err) {
      const { message, needsNewCode } = describeEmailChangeError(err, 'confirm');
      setError(message);
      setCode('');
      if (needsNewCode) setResendAt(null);
      codeRef.current?.focus();
    }
  };

  const onCodeChange = (raw: string) => {
    // Paste-friendly: "123 456", "123-456" or a whole sentence all reduce to digits.
    const next = raw.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(next);
    if (error) setError(null);
    if (next.length === CODE_LENGTH && next !== code) void submitCode(next);
  };

  const onCancelChange = async () => {
    setError(null);
    try {
      await cancelChange().unwrap();
      onClose();
    } catch (err) {
      // Nothing pending any more (expired, or cancelled elsewhere) is the goal anyway.
      if ((err as { status?: unknown })?.status === 404) {
        onClose();
        return;
      }
      setError(describeEmailChangeError(err, 'cancel').message);
    }
  };

  const expiryNote = (() => {
    if (!expiresAt) return null;
    const mins = Math.round((new Date(expiresAt).getTime() - now) / 60000);
    return Number.isFinite(mins) && mins > 0
      ? `It works for ${mins} minute${mins === 1 ? '' : 's'}.`
      : null;
  })();

  const title =
    step === 'done' ? 'Email updated' : step === 'code' ? 'Check your email' : currentEmail ? 'Change your email' : 'Add an email';

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>

      {step === 'enter' && (
        <Box component="form" onSubmit={onSubmitAddress} noValidate>
          <DialogContent sx={{ pt: 0 }}>
            <Typography variant="body2" sx={{ color: '#5b6f72', mb: 2 }}>
              We&apos;ll send a 6-digit code to the new address to check it receives our emails.
              Booking confirmations, receipts and sign-in codes go there once it&apos;s confirmed.
            </Typography>
            <TextField
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (error) setError(null);
              }}
              onBlur={emailHint.onBlur}
              label="New email address"
              type="email"
              autoComplete="email"
              autoFocus
              fullWidth
              size="small"
              error={!!error}
              helperText={error ?? undefined}
              sx={FIELD_SX}
            />
            <EmailSuggestion {...emailHint.hint} className="px-1" />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button onClick={onClose} disabled={busy} sx={QUIET_SX}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={busy || !address.trim()} sx={PRIMARY_SX}>
              {sending ? 'Sending…' : 'Send code'}
            </Button>
          </DialogActions>
        </Box>
      )}

      {step === 'code' && (
        <Box
          component="form"
          noValidate
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            e.stopPropagation();
            void submitCode(code);
          }}
        >
          <DialogContent sx={{ pt: 0 }}>
            <Typography variant="body2" sx={{ color: '#444' }}>
              We sent a 6-digit code to
            </Typography>
            <Typography sx={{ fontWeight: 600, color: '#13272b', wordBreak: 'break-all', mb: 1 }}>
              {target}
            </Typography>
            <Typography variant="body2" sx={{ color: '#5b6f72', mb: 2 }}>
              Enter it below to switch your account to this address.{expiryNote ? ` ${expiryNote}` : ''}
            </Typography>
            <TextField
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              inputRef={codeRef}
              label="6-digit code"
              fullWidth
              size="small"
              error={!!error}
              helperText={error ?? undefined}
              disabled={confirming}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                autoComplete: 'one-time-code',
                'aria-label': '6-digit code',
                style: { letterSpacing: '0.4em', fontSize: '1.15rem', fontWeight: 600 },
              }}
              sx={FIELD_SX}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
              <Button
                onClick={() => void sendCode(target)}
                disabled={busy || waitSeconds > 0 || !target}
                size="small"
                sx={LINK_SX}
              >
                {waitSeconds > 0 ? `Resend code in ${formatWait(waitSeconds)}` : 'Resend code'}
              </Button>
              <Typography component="span" sx={{ color: '#c4cdce' }} aria-hidden>
                ·
              </Typography>
              <Button
                onClick={() => {
                  setError(null);
                  setCode('');
                  setAddress(target);
                  setStep('enter');
                }}
                disabled={busy}
                size="small"
                sx={LINK_SX}
              >
                Use a different email
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button onClick={onCancelChange} disabled={busy} sx={QUIET_SX}>
              {cancelling ? 'Cancelling…' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={busy || code.length !== CODE_LENGTH}
              sx={PRIMARY_SX}
            >
              {confirming ? 'Checking…' : 'Confirm'}
            </Button>
          </DialogActions>
        </Box>
      )}

      {step === 'done' && result && (
        <>
          <DialogContent sx={{ pt: 0 }}>
            <Alert severity="success" sx={{ borderRadius: '12px' }}>
              Your email is now <strong style={{ wordBreak: 'break-all' }}>{result.email}</strong>.
            </Alert>
            {result.resent > 0 && (
              <Typography variant="body2" sx={{ color: '#5b6f72', mt: 1.5 }}>
                We&apos;ve sent {result.resent === 1 ? 'the email' : `the ${result.resent} emails`} that
                didn&apos;t reach you before to this address.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={onClose} variant="contained" sx={PRIMARY_SX}>
              Done
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
