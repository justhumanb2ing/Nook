import { memo } from "react";
import { Button } from "../ui/button";

import { LAYOUT_SIZE_SCALE } from "@/service/blocks/block-layout";

type ResizeOption = { w: number; h: number; label: string };

const SIZE_OPTIONS: ResizeOption[] = [
  { w: 2, h: 2, label: "2x2" },
  { w: 4, h: 2, label: "4x2" },
  { w: 2, h: 4, label: "2x4" },
  { w: 4, h: 4, label: "4x4" },
];

type PageBlockResizeControlsProps = {
  currentW: number;
  currentH: number;
  onResize: (size: { w: number; h: number }) => void;
};

export const PageBlockResizeControls = memo(
  ({ currentW, currentH, onResize }: PageBlockResizeControlsProps) => {
    const storedCurrentW = currentW * LAYOUT_SIZE_SCALE;
    const storedCurrentH = currentH * LAYOUT_SIZE_SCALE;

    return (
      <>
        {SIZE_OPTIONS.map((size) => {
          const isActive =
            storedCurrentW === size.w && storedCurrentH === size.h;
          return (
            <Button
              size={"icon-sm"}
              variant={"ghost"}
              key={size.label}
              type="button"
              onClick={() =>
                onResize({
                  w: size.w / LAYOUT_SIZE_SCALE,
                  h: size.h / LAYOUT_SIZE_SCALE,
                })
              }
              className={`group relative flex flex-col items-center justify-center p-0.5 rounded-lg transition-all ${
                isActive ? "bg-white/20 hover:bg-white/20" : "hover:bg-white/10"
              }`}
              title={size.label}
            >
              <div
                className="grid gap-px"
                style={{
                  gridTemplateColumns: "repeat(2, 6px)",
                  gridTemplateRows: "repeat(2, 6px)",
                }}
              >
                <div
                  className={`w-[5px] h-[5px] rounded-[1px] ${
                    size.w >= 2 && size.h >= 2 ? "bg-white" : "bg-white/20"
                  }`}
                />
                <div
                  className={`w-[5px] h-[5px] rounded-[1px] ${
                    size.w >= 4 && size.h >= 2 ? "bg-white" : "bg-white/20"
                  }`}
                />
                <div
                  className={`w-[5px] h-[5px] rounded-[1px] ${
                    size.w >= 2 && size.h >= 4 ? "bg-white" : "bg-white/20"
                  }`}
                />
                <div
                  className={`w-[5px] h-[5px] rounded-[1px] ${
                    size.w >= 4 && size.h >= 4 ? "bg-white" : "bg-white/20"
                  }`}
                />
              </div>
            </Button>
          );
        })}
      </>
    );
  }
);

PageBlockResizeControls.displayName = "PageBlockResizeControls";
