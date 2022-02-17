declare class NiceScale {
  constructor(minValue: number, maxValue: number, dataOnEdge?: boolean);
  public setAxisLength(axisLength: number): void;
  public setMinMaxValues(minValue: number, maxValue: number): void;
  protected niceNum(range: number, round: boolean): number;
}

declare class CategoricalScale extends NiceScale {
  constructor(categories?: Hermes.Primitive[], dataOnEdge?: boolean);
}

declare class LinearScale extends NiceScale {}

declare class LogScale extends NiceScale {
  constructor(minValue: number, maxValue: number, logBase: number, dataOnEdge?: boolean);
}

declare class Hermes {
  constructor(
    target: HTMLElement | string,
    data: Hermes.Data,
    dimensions: Hermes.Dimension[],
    options?: Hermes.RecursivePartial<Hermes.Config>
  );
  static getTester(): Hermes.Tester;
  setSize(w: number, h: number): void;
  destroy(): void;
}

export = Hermes;

declare namespace Hermes {
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
    type: EActionType,
  };
  export type Boundary = [ Point, Point, Point, Point ];
  export type Focus = { dimIndex: number, filterIndex?: number, type: EFocusType };
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

  export type EActionType = typeof ActionType[keyof typeof ActionType];
  export type EDimensionLayout = typeof DimensionLayout[keyof typeof DimensionLayout];
  export type EDimensionType = typeof DimensionType[keyof typeof DimensionType];
  export type EDirection = typeof Direction[keyof typeof Direction];
  export type EFocusType = typeof FocusType[keyof typeof FocusType];
  export type ELabelPlacement = typeof LabelPlacement[keyof typeof LabelPlacement];
  export type EPathType = typeof PathType[keyof typeof PathType];

  export const ActionType: {
    FilterCreate: 'filter-create',
    FilterMove: 'filter-move',
    FilterResizeAfter: 'filter-resize-after',
    FilterResizeBefore: 'filter-resize-before',
    LabelMove: 'label-move',
    None: 'none',
  };

  export const DimensionLayout: {
    AxisEvenlySpaced: 'axis-evenly-spaced',
    Equidistant: 'equidistant',
    EvenlySpaced: 'evenly-spaced',
  };

  export const DimensionType: {
    Categorical: 'categorical',
    Linear: 'linear',
    Logarithmic: 'logarithmic',
  };

  export const Direction: {
    Horizontal: 'horizontal',
    Vertical: 'vertical',
  };

  export const FocusType: {
    DimensionAxis: 'dimension-axis',
    DimensionLabel: 'dimension-label',
    Filter: 'filter',
    FilterResize: 'filter-resize',
  };

  export const LabelPlacement: {
    After: 'after',
    Before: 'before',
  };

  export const PathType: {
    Bezier: 'bezier',
    Straight: 'straight',
  };

  /**
   * INTERFACES
   */

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
    categories?: Primitive[];
    dataOnEdge?: boolean;
    key: string;
    label: string;
    logBase?: number;
    type: EDimensionType;
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
    placement: ELabelPlacement;
  }

  export interface PathOptions {
    options: {
      bezierFactor?: number;
    };
    type: EPathType;
  }

  export interface Tester {
    generateData: (dimensions: Dimension[], count: number) => Data;
    generateDimensions: (dimCount?: number, random?: boolean) => Dimension[];
  }

  export interface TickOptions extends StyleLine {
    length: number;
  }

  /**
   * PRIMARY INTERFACES AND TYPES
   */

  export type Data = Record<DimensionKey, Primitive[]>;

  export interface Config {
    direction: EDirection;
    resizeThrottleDelay: number;
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
        layout: EDimensionLayout;
      };
      padding: Padding;
    };
  }
}

export as namespace Hermes;
