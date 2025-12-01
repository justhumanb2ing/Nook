"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

type SaveStatusContextValue = {
  status: SaveStatus;
  setStatus: (status: SaveStatus) => void;
};

const SaveStatusContext = createContext<SaveStatusContextValue | null>(null);

export const SaveStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [status, setStatusState] = useState<SaveStatus>("idle");
  const resetRef = useRef<NodeJS.Timeout | null>(null);

  const setStatus = (next: SaveStatus) => {
    setStatusState(next);
    if (resetRef.current) {
      clearTimeout(resetRef.current);
      resetRef.current = null;
    }
    if (next === "saved") {
      resetRef.current = setTimeout(() => {
        setStatusState("idle");
        resetRef.current = null;
      }, 3000);
    }
  };

  return (
    <SaveStatusContext.Provider value={{ status, setStatus }}>
      {children}
    </SaveStatusContext.Provider>
  );
};

export const useSaveStatus = (): SaveStatusContextValue => {
  const ctx = useContext(SaveStatusContext);
  if (!ctx) {
    throw new Error("useSaveStatus must be used within SaveStatusProvider");
  }
  return ctx;
};

export const StatusBadge = ({ status }: { status: SaveStatus }) => {
  const label = useMemo(() => {
    switch (status) {
      case "saving":
        return "변경 중";
      case "saved":
        return "변경 완료";
      case "dirty":
        return "변경 중...";
      case "error":
        return "저장 실패";
      default:
        return "변경 사항 없음";
    }
  }, [status]);

  return (
    <div className="text-xs text-muted-foreground" aria-live="polite">
      {label}
    </div>
  );
};
