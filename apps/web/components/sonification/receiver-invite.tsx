'use client';

/**
 * Compact "Open Receiver on mobile" pill for the Sonificator broadcaster.
 *
 * Click → opens a popover containing:
 *   — QR code pointing at /sonification/receiver
 *   — Copyable absolute URL
 *   — Download PNG / SVG of the QR
 *   — Quick share via Email / Teams / Slack / WhatsApp
 *
 * The popover anchors below-right of the trigger and closes on outside click
 * or Esc. URL is computed client-side so it always reflects the current
 * window origin (works on localhost, preview deployments, and production).
 */

import { useEffect, useRef, useState } from 'react';
import { sonificationReceiverUrl } from '@/lib/qr/links';
import { QRCodeBlock } from '@/components/qr/qr-code';
import { cn } from '@/lib/utils';

export function ReceiverInvite({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string>('');
  const ref = useRef<HTMLDivElement>(null);

  // Compute on mount so we get the real window.origin
  useEffect(() => {
    setUrl(sonificationReceiverUrl());
  }, []);

  // Close on outside click + Esc
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Show a QR code that opens the receiver on a mobile device"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors',
          open
            ? 'border-brand-gold bg-brand-gold-lighter text-brand-gold'
            : 'border-border-default bg-white text-text-secondary hover:border-brand-gold hover:text-brand-gold',
        )}
      >
        {/* QR glyph */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="1" y="1" width="3" height="3" />
          <rect x="8" y="1" width="3" height="3" />
          <rect x="1" y="8" width="3" height="3" />
          <path d="M6 6h.01M8 6h.01M6 8h.01M10 8h.01M6 10h.01M8 10h.01M10 10h.01" strokeLinecap="round" />
        </svg>
        Receiver QR
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Sonification receiver QR code"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[340px] overflow-hidden rounded-lg border border-border-default bg-white shadow-xl"
        >
          <div className="border-b border-border-default px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
              Open receiver on mobile
            </div>
            <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
              Scan the QR with your phone camera. The receiver works without signing in — useful for
              meeting rooms where the listening device isn&apos;t logged into JD Suite.
            </p>
          </div>
          <div className="p-3">
            {url ? (
              <QRCodeBlock
                url={url}
                title="JD Suite Sonification Receiver"
                size={168}
                fileName="sonification-receiver"
              />
            ) : (
              <div className="rounded-md border border-dashed border-border-default p-4 text-center text-[11px] text-text-muted">
                Resolving URL…
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
