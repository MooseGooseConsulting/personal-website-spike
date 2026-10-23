"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SKIN,
  DOCK_STORAGE_KEY,
  isSkinId,
  SKIN_STORAGE_KEY,
  SKINS,
  type SkinDefinition,
  type SkinId,
} from "@/lib/skins";

type SkinContextValue = {
  skin: SkinId;
  definition: SkinDefinition;
  dockOpen: boolean;
  setSkin: (id: SkinId) => void;
  setDockOpen: (open: boolean) => void;
  toggleDock: () => void;
};

const SkinContext = createContext<SkinContextValue | null>(null);

function readStoredSkin(): SkinId {
  if (typeof window === "undefined") return DEFAULT_SKIN;
  try {
    const stored = window.localStorage.getItem(SKIN_STORAGE_KEY);
    if (isSkinId(stored)) return stored;
  } catch {
    /* ignore quota / private mode */
  }
  return DEFAULT_SKIN;
}

function readDockOpen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = window.localStorage.getItem(DOCK_STORAGE_KEY);
    if (stored === "0") return false;
    if (stored === "1") return true;
  } catch {
    /* ignore */
  }
  return true;
}

export function SkinProvider({ children }: { children: ReactNode }) {
  const [skin, setSkinState] = useState<SkinId>(DEFAULT_SKIN);
  const [dockOpen, setDockOpenState] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const next = readStoredSkin();
    const open = readDockOpen();
    document.documentElement.setAttribute("data-skin", next);
    const id = window.setTimeout(() => {
      setSkinState(next);
      setDockOpenState(open);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const setSkin = useCallback((id: SkinId) => {
    setSkinState(id);
    document.documentElement.setAttribute("data-skin", id);
    try {
      window.localStorage.setItem(SKIN_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const setDockOpen = useCallback((open: boolean) => {
    setDockOpenState(open);
    try {
      window.localStorage.setItem(DOCK_STORAGE_KEY, open ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleDock = useCallback(() => {
    setDockOpenState((open) => {
      const next = !open;
      try {
        window.localStorage.setItem(DOCK_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "d" || event.key === "D") {
        event.preventDefault();
        toggleDock();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleDock]);

  const value = useMemo<SkinContextValue>(
    () => ({
      skin,
      definition: SKINS[skin],
      dockOpen,
      setSkin,
      setDockOpen,
      toggleDock,
    }),
    [skin, dockOpen, setSkin, setDockOpen, toggleDock],
  );

  return (
    <SkinContext.Provider value={value}>
      <span className="sr-only" data-skin-ready={ready ? "1" : "0"} />
      {children}
    </SkinContext.Provider>
  );
}

export function useSkin() {
  const ctx = useContext(SkinContext);
  if (!ctx) {
    throw new Error("useSkin must be used within SkinProvider");
  }
  return ctx;
}
