import { useCallback, useEffect, useMemo, useState } from "react";
import type { Layout, Layouts } from "react-grid-layout";
import {
  CANONICAL_BREAKPOINT,
  buildResponsiveLayouts,
  createLayoutLookup,
  extractLayoutPayload,
  projectLayoutsToCanonicalInputs,
  type BlockLayout,
  type GridBreakpoint,
  type LayoutInput,
} from "@/service/blocks/block-layout";

type UseProfileGridLayoutParams = {
  layoutInputs: LayoutInput[];
  isEditable: boolean;
  persistedIds: Set<string>;
  onCommit?: (payload: BlockLayout[]) => void;
};

type ResizeSize = { width: number; height: number };

export const useProfileGridLayout = ({
  layoutInputs,
  isEditable,
  persistedIds,
  onCommit,
}: UseProfileGridLayoutParams) => {
  const [currentLayoutInputs, setCurrentLayoutInputs] =
    useState<LayoutInput[]>(layoutInputs);
  const [layouts, setLayouts] = useState<Layouts>(() =>
    buildResponsiveLayouts(layoutInputs, { isEditable })
  );
  const [currentBreakpoint, setCurrentBreakpoint] =
    useState<GridBreakpoint>(CANONICAL_BREAKPOINT);

  const publishLayoutPayload = useCallback(
    (nextLayouts: Layouts) => {
      if (!onCommit) return;
      const payload = extractLayoutPayload(nextLayouts, persistedIds);
      if (!payload.length) return;
      // 부모 상태 업데이트가 렌더 중에 발생하지 않도록 마이크로태스크로 지연
      queueMicrotask(() => onCommit(payload));
    },
    [onCommit, persistedIds]
  );

  useEffect(() => {
    setCurrentLayoutInputs(layoutInputs);
    setLayouts((previous) =>
      buildResponsiveLayouts(layoutInputs, {
        isEditable,
        existingLayouts: previous,
      })
    );
  }, [isEditable, layoutInputs]);

  const normalizeAndSetLayouts = useCallback(
    (sourceLayouts?: Layouts, nextInputs?: LayoutInput[]) => {
      const inputs = nextInputs ?? currentLayoutInputs;
      const existingLayouts = nextInputs ? undefined : sourceLayouts ?? layouts;
      const normalized = buildResponsiveLayouts(inputs, {
        isEditable,
        existingLayouts,
      });
      setLayouts(normalized);
      setCurrentLayoutInputs(inputs);
      return normalized;
    },
    [currentLayoutInputs, isEditable, layouts]
  );

  const handleLayoutChange = useCallback(
    (_currentLayout: Layout[], allLayouts: Layouts) => {
      const nextInputs = projectLayoutsToCanonicalInputs(
        allLayouts,
        currentBreakpoint
      );
      normalizeAndSetLayouts(allLayouts, nextInputs);
    },
    [currentBreakpoint, normalizeAndSetLayouts]
  );

  const handleLayoutCommit = useCallback(
    (currentLayout?: Layout[], allLayouts?: Layouts) => {
      const mergedLayouts: Layouts | undefined = allLayouts
        ? { ...allLayouts }
        : undefined;

      if (mergedLayouts && currentBreakpoint && currentLayout) {
        mergedLayouts[currentBreakpoint] = currentLayout;
      }

      const inputs = projectLayoutsToCanonicalInputs(
        mergedLayouts ?? layouts,
        currentBreakpoint
      );
      const normalized = normalizeAndSetLayouts(mergedLayouts, inputs);
      publishLayoutPayload(normalized);
    },
    [currentBreakpoint, layouts, normalizeAndSetLayouts, publishLayoutPayload]
  );

  const handleResize = useCallback(
    (id: string, size: ResizeSize) => {
      const nextLayouts: Layouts = { ...layouts };
      const current = layouts[currentBreakpoint] ?? [];
      const updated = current.map((entry) =>
        entry.i === id ? { ...entry, w: size.width, h: size.height } : entry
      );
      nextLayouts[currentBreakpoint] = updated;

      const nextInputs = projectLayoutsToCanonicalInputs(
        nextLayouts,
        currentBreakpoint
      );
      const normalized = normalizeAndSetLayouts(nextLayouts, nextInputs);
      publishLayoutPayload(normalized);
    },
    [
      currentBreakpoint,
      isEditable,
      layouts,
      publishLayoutPayload,
      normalizeAndSetLayouts,
    ]
  );

  const handleBreakpointChange = useCallback((next: string) => {
    setCurrentBreakpoint(next as GridBreakpoint);
  }, []);

  const layoutLookup = useMemo(
    () => createLayoutLookup(layouts, currentBreakpoint),
    [currentBreakpoint, layouts]
  );

  return {
    layouts,
    layoutLookup,
    currentBreakpoint,
    handleLayoutChange,
    handleLayoutCommit,
    handleBreakpointChange,
    handleResize,
  };
};
