"use client";

import { useEffect } from "react";
import { useSearchParams } from '@/lib/router';
import { useHelpStore } from "@/lib/help/store";
import { trackHelpEvent } from "@/lib/help/analytics";

export function DeepLinkBridge() {
  const [params, setParams] = useSearchParams();
  const open = useHelpStore((s) => s.open);

  useEffect(() => {
    const guideId = params.get("help");
    if (!guideId) return;
    open(guideId);
    trackHelpEvent("help_opened", {
      surface: "drawer",
      source: "deep-link",
      article_id: guideId,
    });
    const next = new URLSearchParams(params);
    next.delete("help");
    setParams(next, { replace: true });
  }, [params, open, setParams]);

  return null;
}
