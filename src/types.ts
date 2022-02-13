import CategoricalScale from './classes/CategoricalScale';
import LinearScale from './classes/LinearScale';
import LogScale from './classes/LogScale';

/**
 * TYPES
 */

export type Padding = number | [ number, number ] | [ number, number, number, number ];
export type Primitive = boolean | number | string;
export type Range<T = number> = [ T, T ];
export type RecordKey = string | number | symbol;
export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };

/**
 * Canvas Rendering Types
 */

export type Action = {
  dimIndex: number,
  filterIndex?: number,
  p0: Point,
  p1: Point,
  type: ActionType,
};
export type Boundary = [ Point, Point, Point, Point ];
export type Focus = { dimIndex: number, filterIndex?: number, type: FocusType };
export type Point = { x: number, y: number };
export type Rect = Point & Size;
export type Size = { h: number, w: number };
export type StyleLine = Partial<CanvasFillStrokeStyles & CanvasPathDrawingStyles>;
export type StyleRect = Partial<StyleShape & { cornerRadius: number }>;
export type StyleShape = Partial<CanvasFillStrokeStyles & CanvasPathDrawingStyles>;
export type StyleText = Partial<
  CanvasFillStrokeStyles &
  CanvasPathDrawingStyles &
  CanvasTextDrawingStyles
>;

/**
 * Data Types
 */

export type DimensionKey = string;

/**
 * ENUMERABLES
 */

export enum ActionType {
  FilterCreate = 'filter-create',
  FilterMove = 'filter-move',
  FilterResizeAfter = 'filter-resize-after',
  FilterResizeBefore = 'filter-resize-before',
  LabelMove = 'label-move',
  None = 'none',
}

export enum AxisType {
  Categorical = 'categorical',
  Linear = 'linear',
  Logarithmic = 'logarithmic',
}

export enum DimensionLayout {
  AxisEvenlySpaced = 'axis-evenly-spaced',
  Equidistant = 'equidistant',
  EvenlySpaced = 'evenly-spaced',
}

export enum Direction {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum FocusType {
  DimensionLabel = 'dimension-label',
  DimensionAxis = 'dimension-axis',
  Filter = 'filter',
  FilterResize = 'filter-resize',
}

export enum LabelPlacement {
  After = 'after',
  Before = 'before',
}

export enum PathType {
  Bezier = 'bezier',
  Straight = 'straight',
}

/**
 * INTERFACES
 */

export interface Axis {
  // auto?: boolean;
  categories?: Primitive[];
  dataOnEdge?: boolean;
  logBase?: number;
  range?: Range;
  scale: CategoricalScale | LinearScale | LogScale;
  type: AxisType;
}

export interface AxisOptions extends StyleLine {
  boundaryPadding: number;
}

export interface DataColorScale {
  colors: string[];
  dimensionKey: DimensionKey;
}

export interface DataOptions {
  colorScale?: {
    colors: string[];
    dimensionKey: DimensionKey;
  };
  default: StyleLine;
  defaultColorScale?: DataColorScale;
  filtered: StyleLine;
  filteredColorScale?: DataColorScale;
  path: PathOptions;
}

export interface Dimension {
  axis: Axis;
  key: string;
  label: string;
}

export interface LabelMoveOptions extends LabelOptions {
  boundaryPadding: number;
}

export interface Filter {
  p0: number;         // starting axis % position relative to axisStart.(x|y).
  p1: number;         // ending axis % position relative to axisStart.(x|y).
  value0: Primitive;  // starting axis value.
  value1: Primitive;  // ending axis value.
}

export interface FilterActive extends Filter {
  startP0?: number;   // Initial p0 value before an existing filter is shifted via dragging.
  startP1?: number;   // Initial p1 value before an existing filter is shifted via dragging.
}

export interface FilterOptions extends StyleRect {
  width: number;
}

export interface LabelOptions extends StyleText {
  angle?: number;
  offset: number;
  placement: LabelPlacement;
}

export interface PathOptions {
  options: {
    bezierFactor?: number;
  };
  type: PathType;
}

export interface TickOptions extends StyleLine {
  length: number;
}

/**
 * PRIMARY INTERFACES AND TYPES
 */

export type HermesData = Record<DimensionKey, Primitive[]>;

export interface HermesOptions {
  direction: Direction;
  //hooks: {},
  style: {
    axes: {
      axis: AxisOptions,
      axisActve: StyleLine;
      axisHover: StyleLine;
      filter: FilterOptions;
      filterActive: FilterOptions;
      filterHover: FilterOptions;
      label: LabelOptions;
      labelActive: StyleText;
      labelHover: StyleText;
      tick: TickOptions;
      tickActive: StyleLine;
      tickHover: StyleLine;
    };
    data: DataOptions;
    dimension: {
      label: LabelMoveOptions;
      labelActive: StyleText;
      labelHover: StyleText;
      layout: DimensionLayout;
    };
    padding: Padding;
  };
}

export interface IX {
  dimension: {
    axis: number;
    bound?: Rect;
    boundOffset?: Point;
    offset: number;
  };
  filters: {
    active: FilterActive;
    key?: DimensionKey;
  };
  shared: {
    action: Action;
    focus?: Focus;
  };
}

export interface Filters {
  [key: DimensionKey]: Filter[];
}

export interface Internal {
  dims: {
    list: {
      axes: {
        maxLength: number;
        tickLabels: string[];
        tickPos: number[];
        ticks: number[];
      };
      label: {
        h: number;
        lengthCos: number;
        lengthSin: number;
        w: number;
      };
      layout: {
        axisBoundary: Boundary;   // Coordinates for axis boundary after transformation.
        axisStart: Point;         // Respective to bound (x, y)
        axisStop: Point;          // Respective to bound (x, y)
        bound: Rect;              // Bounding rect for the dimension label and axis.
        boundOffset: Point;       // Offset for the bounding rect from dragging.
        labelBoundary: Boundary;  // Coordinates for label boundary after transformation.
        labelPoint: Point;        // Respective to bound (x, y)
        spaceAfter: number;       // Space after the axis line.
        spaceBefore: number;      // Space before the axis line.
      };
    }[];
    shared: {
      axes: {
        labelFactor: number;
        length: number;
        maxTicks: number;
        start: number;
        stop: number;
      };
      dataCount: number;
      label: {
        cos?: number;
        maxLengthCos?: number;
        maxLengthSin?: number;
        rad?: number;
        sin?: number;
      };
      layout: {
        gap: number;
        offset: number;
        space: number;
        totalBoundSpace: number;
      };
    };
  };
  layout: {
    drawRect: Rect;
    padding: [ number, number, number, number ];
  };
  styles: {
    axis: StyleLine;
    filters: FilterOptions[];
    label: StyleText;
    tick: StyleLine;
    tickLabel: StyleText;
  }[];
}
