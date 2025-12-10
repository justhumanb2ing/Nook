import { useMemo } from "react";

import { Toggle, ToggleGroup } from "@/components/ui/toggle-group";
import { Toolbar, ToolbarButton } from "@/components/ui/toolbar";
import { cn } from "@/lib/utils";

type BlockSizeOption = {
  value: BlockSizeValue;
  label: string;
  width: number;
  height: number;
};

type BlockSizeValue = "1x1" | "1x2" | "2x1" | "2x2";

type BlockSizeToolbarProps = {
  width: number;
  height: number;
  visible?: boolean;
  className?: string;
  onSizeChange?: (nextSize: BlockSizeOption) => void;
};

const SIZE_OPTIONS: BlockSizeOption[] = [
  { value: "1x1", label: "1x1", width: 1, height: 1 },
  { value: "1x2", label: "1x2", width: 1, height: 2 },
  { value: "2x1", label: "2x1", width: 2, height: 1 },
  { value: "2x2", label: "2x2", width: 2, height: 2 },
];

const HOVER_TRANSITION_MS = 120;
const clampDimension = (value: number): number => {
  if (!Number.isFinite(value)) return 1;
  const rounded = Math.round(value);
  return Math.min(Math.max(rounded, 1), 2);
};

const resolveSizeOption = (width: number, height: number): BlockSizeOption => {
  const normalizedWidth = clampDimension(width);
  const normalizedHeight = clampDimension(height);
  return (
    SIZE_OPTIONS.find(
      (option) =>
        option.width === normalizedWidth && option.height === normalizedHeight
    ) ?? SIZE_OPTIONS[0]
  );
};

export default function BlockSizeToolbar({
  width,
  height,
  visible = false,
  className,
  onSizeChange,
}: BlockSizeToolbarProps) {
  const selectedOption = useMemo(
    () => resolveSizeOption(width, height),
    [height, width]
  );

  const handleValueChange = (groupValue: BlockSizeValue[]) => {
    const [nextValue] = groupValue;
    if (!nextValue || nextValue === selectedOption.value) return;

    const nextOption = SIZE_OPTIONS.find(
      (option) => option.value === nextValue
    );
    if (!nextOption) return;
    onSizeChange?.(nextOption);
  };

  return (
    <Toolbar
      className={cn(
        "pointer-events-auto rounded-xl bg-foreground shadow-md backdrop-blur transition-opacity",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
        className
      )}
      data-no-drag
      style={{ transitionDuration: `${HOVER_TRANSITION_MS}ms` }}
    >
      <ToggleGroup
        className="border-none p-0 space-x-1"
        defaultValue={[selectedOption.value]}
        value={[selectedOption.value]}
        onValueChange={handleValueChange}
      >
        {SIZE_OPTIONS.map((option) => (
          <ToolbarButton
            key={option.value}
            render={
              <Toggle
                size={"sm"}
                value={option.value}
                aria-label={`${option.width}x${option.height} block size`}
                className={cn(
                  "aspect-square text-white",
                  "hover:bg-background/20 data-pressed:bg-background data-pressed:text-foreground"
                )}
              />
            }
          >
            {option.label}
          </ToolbarButton>
        ))}
      </ToggleGroup>
    </Toolbar>
  );
}
