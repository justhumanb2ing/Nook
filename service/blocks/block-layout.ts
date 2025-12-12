import type { Layout, Layouts } from "react-grid-layout";

export const GRID_BREAKPOINTS = {
  lg: 700,
  xxs: 0,
} as const;

export const GRID_RESPONSIVE_COLUMNS = {
  lg: 4,
  xxs: 2,
} as const;

export type GridBreakpoint = keyof typeof GRID_BREAKPOINTS;

export const CANONICAL_BREAKPOINT: GridBreakpoint = "lg";
export const GRID_COLUMNS = GRID_RESPONSIVE_COLUMNS[CANONICAL_BREAKPOINT];
export const GRID_ROWS = 175;
export const GRID_ROW_HEIGHT = 175;
export const GRID_MARGIN: [number, number] = [26, 26];
export const MIN_SIZE = 1;
export const MAX_SIZE = GRID_COLUMNS;
export const LAYOUT_SIZE_SCALE = 2;
export const DESKTOP_BREAKPOINT: GridBreakpoint = "lg";
export const MOBILE_BREAKPOINT: GridBreakpoint = "xxs";

export type LayoutInput = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type ResponsiveLayoutInputs = Partial<
  Record<GridBreakpoint, LayoutInput[]>
>;

export type BlockLayout = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type ViewportLayout = Omit<BlockLayout, "id">;

export type ResponsiveBlockLayout = {
  id: string;
  desktop: ViewportLayout;
  mobile: ViewportLayout;
};

type LayoutSource =
  | Layout
  | LayoutInput
  | {
      id: string;
      x?: number | null;
      y?: number | null;
      w?: number | null;
      h?: number | null;
    };

const BREAKPOINT_KEYS = Object.keys(
  GRID_RESPONSIVE_COLUMNS
) as GridBreakpoint[];

const clampSpan = (value: number | null | undefined, max: number): number => {
  const normalized =
    typeof value === "number" && Number.isFinite(value)
      ? Math.max(Math.round(value), MIN_SIZE)
      : MIN_SIZE;
  return Math.min(normalized, Math.max(MIN_SIZE, max));
};

const clampCoordinate = (value: number | null | undefined, max: number) => {
  const normalized =
    typeof value === "number" && Number.isFinite(value)
      ? Math.max(Math.floor(value), 0)
      : 0;
  return Math.min(normalized, Math.max(0, max));
};

const isLayoutEntry = (source: LayoutSource): source is Layout =>
  "i" in source;

const toLayoutId = (source: LayoutSource): string =>
  isLayoutEntry(source) ? source.i : String(source.id);

const normalizeLayoutEntry = (
  source: LayoutSource,
  columns: number,
  fallbackIndex: number,
  isEditable: boolean
): Layout => {
  const width = clampSpan(
    isLayoutEntry(source) ? source.w : source.w,
    Math.min(columns, MAX_SIZE)
  );
  const height = clampSpan(
    isLayoutEntry(source) ? source.h : source.h,
    MAX_SIZE
  );

  const baseX = isLayoutEntry(source) ? source.x : source.y;
  const baseY = isLayoutEntry(source) ? source.y : source.x ?? fallbackIndex;

  const maxX = Math.max(columns - width, 0);
  const maxY = Math.max(GRID_ROWS - height, 0);

  return {
    i: toLayoutId(source),
    x: clampCoordinate(baseX, maxX),
    y: clampCoordinate(baseY, maxY),
    w: width,
    h: height,
    isDraggable: isEditable,
    isResizable: false,
    static: !isEditable,
  };
};

/**
 * Block 레이아웃과 기존 Layout을 입력으로 받아 각 브레이크포인트별 Layouts를 구성한다.
 * - 기존 Layout이 있으면 우선 사용하고, 없으면 Block 좌표(x=행, y=열)를 RGL 좌표(x=열, y=행)로 스왑한다.
 */
export const buildResponsiveLayouts = (
  inputs: ResponsiveLayoutInputs,
  options?: { existingLayouts?: Layouts; isEditable?: boolean }
): Layouts => {
  const isEditable = options?.isEditable ?? false;
  const existingLayouts = options?.existingLayouts ?? {};
  const nextLayouts: Layouts = {};

  BREAKPOINT_KEYS.forEach((breakpoint) => {
    const columns = GRID_RESPONSIVE_COLUMNS[breakpoint];
    const existing = existingLayouts[breakpoint] ?? [];
    const existingMap = new Map(existing.map((entry) => [entry.i, entry]));
    const breakpointInputs =
      inputs[breakpoint] ?? inputs[CANONICAL_BREAKPOINT] ?? [];

    nextLayouts[breakpoint] = breakpointInputs.map((item, index) => {
      const fallback = existingMap.get(item.id) ?? item;
      return normalizeLayoutEntry(fallback, columns, index, isEditable);
    });
  });

  return nextLayouts;
};

export const createLayoutLookup = (
  layouts: Layouts,
  breakpoint: GridBreakpoint
): Map<string, Layout> =>
  new Map((layouts[breakpoint] ?? []).map((entry) => [entry.i, entry]));

/**
 * RGL Layouts를 서버로 전송할 BlockLayout payload로 변환한다.
 * - DB는 x=행, y=열을 사용하므로 RGL 좌표(x=열, y=행)를 반대로 매핑한다.
 */
export const extractResponsiveLayoutPayload = (
  layouts: Layouts,
  persistedIds: Set<string>
): ResponsiveBlockLayout[] => {
  const desktopLayout = layouts[DESKTOP_BREAKPOINT] ?? [];
  const mobileLayout = layouts[MOBILE_BREAKPOINT] ?? [];
  const desktopColumns = GRID_RESPONSIVE_COLUMNS[DESKTOP_BREAKPOINT];
  const mobileColumns = GRID_RESPONSIVE_COLUMNS[MOBILE_BREAKPOINT];

  const normalizeEntry = (
    entry: Layout,
    columns: number
  ): ViewportLayout => {
    const width = clampSpan(entry.w, Math.min(columns, MAX_SIZE));
    const height = clampSpan(entry.h, MAX_SIZE);
    const maxX = Math.max(GRID_ROWS - height, 0);
    const maxY = Math.max(columns - width, 0);

    return {
      x: clampCoordinate(entry.y, maxX),
      y: clampCoordinate(entry.x, maxY),
      w: width,
      h: height,
    };
  };

  const desktopMap = new Map(
    desktopLayout
      .filter((item) => persistedIds.has(item.i))
      .map((item) => [item.i, normalizeEntry(item, desktopColumns)])
  );
  const mobileMap = new Map(
    mobileLayout
      .filter((item) => persistedIds.has(item.i))
      .map((item) => [item.i, normalizeEntry(item, mobileColumns)])
  );

  return Array.from(persistedIds).map((id) => {
    const desktop = desktopMap.get(id) ?? {
      x: 0,
      y: 0,
      w: MIN_SIZE,
      h: MIN_SIZE,
    };
    const mobile = mobileMap.get(id) ?? desktop;
    return {
      id,
      desktop,
      mobile,
    };
  });
};

/**
 * 주어진 브레이크포인트의 Layouts를 기반으로 DB 좌표계 LayoutInput으로 투영한다.
 * - RGL 좌표(x=열, y=행)를 DB 좌표(x=행, y=열)로 재변환한다.
 * - 저장은 canonical breakpoint 기준(col: GRID_RESPONSIVE_COLUMNS[CANONICAL_BREAKPOINT])으로 정규화한다.
 */
export const projectLayoutsToInputs = (
  layouts: Layouts,
  breakpoint: GridBreakpoint
): LayoutInput[] => {
  const sourceLayout = layouts[breakpoint] ?? [];
  const columns = GRID_RESPONSIVE_COLUMNS[breakpoint];

  return sourceLayout.map((entry) => {
    const width = clampSpan(entry.w, Math.min(columns, MAX_SIZE));
    const height = clampSpan(entry.h, MAX_SIZE);
    const maxX = Math.max(GRID_ROWS - height, 0);
    const maxY = Math.max(columns - width, 0);

    return {
      id: entry.i,
      x: clampCoordinate(entry.y, maxX),
      y: clampCoordinate(entry.x, maxY),
      w: width,
      h: height,
    };
  });
};

export const sortByLayout = (layouts: BlockLayout[]): BlockLayout[] =>
  [...layouts].sort((a, b) => {
    const rowDiff = a.y - b.y;
    if (rowDiff !== 0) return rowDiff;
    const colDiff = a.x - b.x;
    if (colDiff !== 0) return colDiff;
    return a.id.localeCompare(b.id);
  });
