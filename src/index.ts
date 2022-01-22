import { deepmerge } from 'deepmerge-ts';

import HermesError from './classes/HermesError';
import NiceScale from './classes/NiceScale';
import * as t from './types';
import {
  drawCircle,
  drawLine,
  drawRect,
  drawTextAngled, getFont, getTextSize, normalizePadding,
} from './utils/canvas';
import { getElement } from './utils/dom';

const CONFIG = { TICK_DISTANCE: 5 };

const DEFAULT_OPTIONS: t.HermesOptions = {
  direction: t.Direction.Horizontal,
  style: {
    axes: {
      axis: {
        color: 'grey',
        width: 1,
      },
      label: {
        color: 'blue',
        font: { size: 12 },
        offset: 10,
        placement: t.LabelPlacement.After,
      },
      tick: {
        color: 'red',
        length: 10,
        width: 1,
      },
    },
    dimension: {
      label: {
        angle: 3 * Math.PI / 4,
        color: 'black',
        font: { size: 14 },
        offset: 10,
        placement: t.LabelPlacement.Before,
      },
    },
    padding: 25,
  },
};

class Hermes {
  private element: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private resizeObserver: ResizeObserver;
  private dimensions: t.Dimension[];
  private options: t.HermesOptions;
  private size: t.Size = { h: 0, w: 0 };
  private _?: t.Internal = undefined;

  constructor(
    target: HTMLElement | string,
    dimensions: t.Dimension[],
    options: t.RecursivePartial<t.HermesOptions> = {},
  ) {
    const element = getElement(target);
    if (!element) throw new HermesError('Target element selector did not match anything.');
    this.element = element;

    // Create a canvas and append it to the target element.
    this.canvas = document.createElement('canvas');
    this.element.appendChild(this.canvas);

    // Setup initial canvas size.
    const rect = this.element.getBoundingClientRect();
    this.setSize(rect.width, rect.height);

    // Get canvas context.
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new HermesError('Unable to get context from target element.');
    this.ctx = ctx;

    this.dimensions = dimensions;
    this.options = deepmerge(DEFAULT_OPTIONS, options) as t.HermesOptions;

    // Add resize observer to detect target element resizing.
    this.resizeObserver = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      this.setSize(rect.width, rect.height);
      this.calculate();
    });
    this.resizeObserver.observe(this.element);
  }

  destroy(): void {
    this.resizeObserver.unobserve(this.element);
  }

  draw(): void {
    // Set line width
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = 'black';

    // calculate dimension labels
    // calculate axis labels

    // this.drawDimensions();

    // this.ctx.fillRect(100, 100, 100, 100);

    // Wall
    // this.ctx.strokeRect(0, 0, 100, 100);

    // // Door
    // this.ctx.fillRect(130, 190, 40, 60);

    // // Roof
    // this.ctx.beginPath();
    // this.ctx.moveTo(50, 140);
    // this.ctx.lineTo(150, 60);
    // this.ctx.lineTo(250, 140);
    // this.ctx.closePath();
    // this.ctx.stroke();
  }

  calculate(): void {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const _: any = {
      dims: {
        list: new Array(this.dimensions.length)
          .fill(undefined)
          .map(() => ({ axes: {}, label: {}, layout: {} })),
        shared: { axes: {}, label: {}, layout: {} },
      },
      layout: {
        drawRect: {},
        padding: normalizePadding(this.options.style.padding),
      },
    };

    const isHorizontal = this.options.direction === t.Direction.Horizontal;
    const dimLabelStyle = this.options.style.dimension.label;
    const axesLabelStyle = this.options.style.axes.label;
    const placement = dimLabelStyle.placement;
    const dimCount = this.dimensions.length;

    const _l = _.layout;
    const _dsa = _.dims.shared.axes;
    const _dsl = _.dims.shared.label;
    const _dsly = _.dims.shared.layout;

    /**
     * Calculate actual render area (canvas minus padding).
     */
    _l.drawRect = {
      h: this.size.h - _l.padding[0] - _l.padding[2],
      w: this.size.w - _l.padding[1] - _l.padding[3],
      x: _l.padding[3],
      y: _l.padding[0],
    };

    /**
     * Go through each of the dimension labels and calculate the size
     * of each one and figure out how much space is needed for them.
     */
    _dsl.cos = dimLabelStyle.angle != null ? Math.cos(dimLabelStyle.angle) : undefined;
    _dsl.sin = dimLabelStyle.angle != null ? Math.sin(dimLabelStyle.angle) : undefined;
    _dsl.maxLengthCos = 0;
    _dsl.maxLengthSin = 0;
    this.dimensions.forEach((dimension, index) => {
      const textSize = getTextSize(this.ctx, dimension.label, dimLabelStyle.font);
      const _dlil = _.dims.list[index].label;
      _dlil.w = textSize.w;
      _dlil.h = textSize.h;
      _dlil.lengthCos = _dsl.cos != null ? textSize.w * _dsl.cos : textSize.w;
      _dlil.lengthSin = _dsl.sin != null ? textSize.w * _dsl.sin : textSize.h;
      if (_dlil.lengthCos > _dsl.maxLengthCos) _dsl.maxLengthCos = _dlil.lengthCos;
      if (_dlil.lengthSin > _dsl.maxLengthSin) _dsl.maxLengthSin = _dlil.lengthSin;
    });

    /**
     * Figure out the max axis pixel range after dimension labels are calculated.
     */
    _dsa.start = 0;
    _dsa.stop = 0;
    if (isHorizontal) {
      if (placement === t.LabelPlacement.Before) {
        _dsa.start = _l.padding[0] + _dsl.maxLengthSin + dimLabelStyle.offset;
        _dsa.stop = this.size.h - _l.padding[2];
      } else {
        _dsa.start = _l.padding[0];
        _dsa.stop = this.size.h - _l.padding[2] - _dsl.maxLengthSin - dimLabelStyle.offset;
      }
    } else {
      if (placement === t.LabelPlacement.Before) {
        _dsa.start = _l.padding[3] + _dsl.maxLengthCos + dimLabelStyle.offset;
        _dsa.stop = this.size.w - _l.padding[1];
      } else {
        _dsa.start = _l.padding[3];
        _dsa.stop = this.size.w - _l.padding[1] - _dsl.maxLengthCos - dimLabelStyle.offset;
      }
    }

    /**
     * Go through each axis and figure out the sizes of each axis labels.
     */
    _dsa.maxTicks = (_dsa.stop - _dsa.start) / CONFIG.TICK_DISTANCE;
    _dsa.scale = new NiceScale(_dsa.maxTicks);
    _dsa.labelFactor = axesLabelStyle.placement === t.LabelPlacement.Before ? -1 : 1;
    _dsly.totalBoundSpace = 0;
    for (let i = 0; i < dimCount; i++) {
      const _dlia = _.dims.list[i].axes;
      const _dlil = _.dims.list[i].label;
      const _dlily = _.dims.list[i].layout;

      /**
       * Save scale info for each axis.
       */
      _dsa.scale.setMinMaxValues(-100, 100);
      _dlia.scale = {
        max: _dsa.scale.max,
        min: _dsa.scale.min,
        range: _dsa.scale.range,
        ticks: _dsa.scale.ticks.slice(),
        tickSpacing: _dsa.scale.tickSpacing,
      };

      /**
       * Find the longest axis label.
       */
      _dlia.maxLength = _dsa.scale.ticks.reduce((acc: number, tick: number) => {
        const size = getTextSize(this.ctx, tick.toString(), axesLabelStyle.font);
        return Math.max(size.w, acc);
      }, 0);

      /**
       * Figure out where the axis alignment center should be.
       * First, base it on the direction and dimension label placement.
       */
      if (_dlil.lengthCos == null) {
        _dlily.spaceBefore = (isHorizontal ? _dlil.w : _dlil.h) / 2;
        _dlily.spaceAfter = _dlily.spaceBefore;
      } else if (isHorizontal) {
        _dlily.spaceBefore = _dlil.lengthCos < 0 ? -_dlil.lengthCos : 0;
        _dlily.spaceAfter = _dlil.lengthCos > 0 ? _dlil.lengthCos : 0;
      } else {
        _dlily.spaceBefore = _dlil.lengthSin > 0 ? _dlil.lengthSin : 0;
        _dlily.spaceAfter = _dlil.lengthSin < 0 ? -_dlil.lengthSin : 0;
      }

      /**
       * See if axes labels are long enough to shift the axis center.
       */
      if (axesLabelStyle.placement === t.LabelPlacement.Before) {
        _dlily.spaceBefore = Math.max(_dlily.spaceBefore, _dlia.maxLength);
      } else {
        _dlily.spaceAfter = Math.max(_dlily.spaceAfter, _dlia.maxLength);
      }
      _dlily.spaceOffset = _dlily.spaceAfter - _dlily.spaceBefore;

      /**
       * Caclulate the layout positions.
       */
      if (isHorizontal) {
        _dlily.bound = {
          h: this.size.h - _l.padding[0] - _l.padding[2],
          w: _dlily.spaceBefore + _dlily.spaceAfter,
          x: 0,
          y: _l.padding[0],
        };
        _dsly.totalBoundSpace += _dlily.bound.w;
      } else {
        _dlily.bound = {
          h: _dlily.spaceBefore + _dlily.spaceAfter,
          w: this.size.w - _l.padding[1] - _l.padding[3],
          x: _l.padding[3],
          y: 0,
        };
        _dsly.totalBoundSpace += _dlily.bound.h;
      }
    }

    /**
     * Calculate the gap spacing between the dimensions.
     */
    if (isHorizontal) {
      _dsly.gap = dimCount > 1 ? (_l.drawRect.w - _dsly.totalBoundSpace) / (dimCount - 1) : 0;
    } else {
      _dsly.gap = dimCount > 1 ? (_l.drawRect.h - _dsly.totalBoundSpace) / (dimCount - 1) : 0;
    }

    /**
     * Update the dimension bounding position.
     */
    let traversed = isHorizontal ? _l.padding[3] : _l.padding[0];
    for (let i = 0; i < dimCount; i++) {
      const _dlily = _.dims.list[i].layout;

      if (isHorizontal) {
        _dlily.bound.x = traversed;
        _dlily.axisStart = { x: _dlily.spaceBefore, y: _dsa.start - _l.padding[0] };
        _dlily.axisStop = { x: _dlily.spaceBefore, y: _dsa.stop - _l.padding[0] };
        _dlily.labelPoint = {
          x: _dlily.spaceBefore,
          y: placement === t.LabelPlacement.Before
            ? _dsa.start - dimLabelStyle.offset - _l.padding[0]
            : _dsa.stop + dimLabelStyle.offset - _l.padding[0],
        };
        traversed += _dsly.gap + _dlily.bound.w;
      } else {
        _dlily.bound.y = traversed;
        _dlily.axisStart = { x: _dsa.start - _l.padding[3], y: _dlily.spaceBefore };
        _dlily.axisStop = { x: _dsa.stop - _l.padding[3], y: _dlily.spaceBefore };
        _dlily.labelPoint = {
          x: placement === t.LabelPlacement.Before
            ? _dsa.start - dimLabelStyle.offset - _l.padding[1]
            : _dsa.stop + dimLabelStyle.offset - _l.padding[1],
          y: _dlily.spaceBefore,
        };
        traversed += _dsly.gap + _dlily.bound.h;
      }
    }
    this._ = _;
    console.log(this._);

    drawLine(this.ctx, 0, _l.padding[0], this.size.w, _l.padding[0]);
    drawLine(this.ctx, 0, this.size.h - _l.padding[2], this.size.w, this.size.h - _l.padding[2]);
    drawLine(this.ctx, _l.padding[3], 0, _l.padding[3], this.size.h);
    drawLine(this.ctx, this.size.w - _l.padding[1], 0, this.size.w - _l.padding[1], this.size.h);

    _.dims.list.forEach((dim: any) => {
      const bound = dim.layout.bound;
      const axisStart = dim.layout.axisStart;
      const axisStop = dim.layout.axisStop;
      const labelPoint = dim.layout.labelPoint;
      drawRect(this.ctx, bound.x, bound.y, bound.w, bound.h);
      drawCircle(this.ctx, bound.x + labelPoint.x, bound.y + labelPoint.y, 3);
      drawLine(
        this.ctx,
        bound.x + axisStart.x,
        bound.y + axisStart.y,
        bound.x + axisStop.x,
        bound.y + axisStop.y,
        { strokeStyle: 'purple' },
      );
    });

    const font = getFont(this.options.style.dimension.label.font);
    const rad = this.options.style.dimension.label.angle || 0;
    this.dimensions.forEach((dimension, index) => {
      const bound = _.dims.list[index].layout.bound;
      const labelPoint = _.dims.list[index].layout.labelPoint;
      const x = bound.x + labelPoint.x;
      const y = bound.y + labelPoint.y;
      drawTextAngled(this.ctx, dimension.label, font, x, y, rad);
    });
  }

  setSize(w: number, h: number): void {
    this.canvas.width = w;
    this.canvas.height = h;
    this.size = { h, w };
  }
}

export default Hermes;
