"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/cn";

/**
 * Wraps the calendar toolbar and grid so they can fill the screen on their own. Uses the
 * Fullscreen API where available and a fixed overlay otherwise (e.g. iPhone Safari).
 * Client-side navigation keeps this component mounted, so the arrows and view switch
 * work without leaving full screen.
 */
export function CalendarFrame({ toolbar, children }: { toolbar: ReactNode; children: ReactNode }) {
  const c = useT().appointments.calendar;
  const ref = useRef<HTMLDivElement>(null);
  const [native, setNative] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const fullscreen = native || overlay;

  useEffect(() => {
    const sync = () => setNative(document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => {
    if (!overlay) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOverlay(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", close);
    };
  }, [overlay]);

  const toggle = async () => {
    if (native) return void (await document.exitFullscreen());
    if (overlay) return setOverlay(false);
    try {
      await ref.current!.requestFullscreen();
    } catch {
      setOverlay(true);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "grid gap-6",
        fullscreen && "fixed inset-0 z-50 content-start overflow-auto bg-surface-subtle p-4 sm:p-6",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {toolbar}
        <Button
          type="button"
          variant={fullscreen ? "primary" : "secondary"}
          size={fullscreen ? "sm" : "icon-sm"}
          onClick={toggle}
          aria-label={fullscreen ? undefined : c.fullscreen}
          title={fullscreen ? undefined : c.fullscreen}
        >
          {fullscreen ? (
            <>
              <Minimize2 aria-hidden="true" /> {c.exitFullscreen}
            </>
          ) : (
            <Maximize2 aria-hidden="true" />
          )}
        </Button>
      </div>
      {children}
    </div>
  );
}
