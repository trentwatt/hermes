import * as t from './types';

export const BEZIER_FACTOR = 0.3;
export const DIRECTION: CanvasDirection = 'inherit';
export const FILL_STYLE = 'black';
export const FONT = 'normal 12px san-serif';
export const LINE_CAP: CanvasLineCap = 'butt';
export const LINE_DASH_OFFSET = 0.0;
export const LINE_JOIN: CanvasLineJoin = 'round';
export const LINE_WIDTH = 1.0;
export const MITER_LIMIT = 10.0;
export const STROKE_STYLE = 'black';
export const TEXT_ALIGN = 'left';
export const TEXT_BASELINE = 'middle';

export const INVALID_VALUE = Number.NaN;
export const INVALID_POINT = { x: Number.NaN, y: Number.NaN };
export const INVALID_RECT = { h: Number.NaN, w: Number.NaN, x: Number.NaN, y: Number.NaN };

export const HERMES_OPTIONS: t.HermesOptions = {
  direction: t.Direction.Horizontal,
  style: {
    axes: {
      axis: {
        boundaryPadding: 10,
        fillStyle: 'black',
        lineWidth: 1,
      },
      filter: {
        fillStyle: 'rgba(0, 0, 0, 0.3)',
        strokeStyle: 'rgba(0, 0, 0, 1.0)',
        width: 30,
      },
      label: {
        fillStyle: 'rgba(0, 0, 0, 1.0)',
        font: 'normal 11px sans-serif',
        lineWidth: 3,
        offset: 4,
        placement: t.LabelPlacement.Before,
        strokeStyle: 'rgba(255, 255, 255, 1.0)',
      },
      tick: {
        fillStyle: 'black',
        length: 4,
        lineWidth: 1,
      },
    },
    data: {
      default: {
        lineWidth: 1,
        strokeStyle: 'rgba(82, 144, 244, 0.3)',
      },
      filtered: {
        lineWidth: 1,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
      },
      path: {
        options: {},
        type: t.PathType.Straight,
      },
    },
    dimension: {
      label: {
        angle: Math.PI / 4,
        boundaryPadding: 5,
        fillStyle: 'rgba(0, 0, 0, 1.0)',
        font: 'normal 12px sans-serif',
        lineWidth: 3,
        offset: 10,
        placement: t.LabelPlacement.Before,
        strokeStyle: 'rgba(255, 255, 255, 1.0)',
      },
      layout: t.DimensionLayout.AxisEvenlySpaced,
    },
    padding: 50,
  },
};

export const FILTER = {
  p0: Number.NaN,
  p1: Number.NaN,
  value0: Number.NaN,
  value1: Number.NaN,
};

export const DRAG = {
  dimension: {
    bound0: undefined,
    bound1: undefined,
    offset: { x: 0, y: 0 },
  },
  filters: {
    active: FILTER,
    axes: {},
    key: undefined,
  },
  shared: {
    index: -1,
    p0: { x: Number.NaN, y: Number.NaN },
    p1: { x: Number.NaN, y: Number.NaN },
  },
  type: t.DragType.None,
};