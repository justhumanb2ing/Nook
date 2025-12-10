'use client';

import { StatusBadge, useSaveStatus } from "./save-status-context";

export default function SavingStatusSection() {
  const { status } = useSaveStatus();
  return (
    <div className="z-10 bg-background flex justify-end">
      <div className="p-1 px-2 rounded-md min-w-24 text-center">
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
