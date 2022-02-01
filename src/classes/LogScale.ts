import { Primitive, Range } from '../types';
import { isNumber } from '../utils/data';
import { readableTick } from '../utils/string';

import NiceScale from './NiceScale';

export const DEFAULT_LOG_BASE = 10;

class LogScale extends NiceScale {
  protected denominator: number;
  protected log: (x: number) => number;
  protected maxExp: number = Number.NaN;
  protected minExp: number = Number.NaN;

  constructor(
    minValue: number,
    maxValue: number,
    protected logBase: number = DEFAULT_LOG_BASE,
  ) {
    super(minValue, maxValue);
    this.denominator = 1;
    this.log = Math.log;
    this.logBase = logBase;
  }

  public setMinMaxValues(
    minValue: number,
    maxValue: number,
    logBase: number = DEFAULT_LOG_BASE,
  ): void {
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.logBase = logBase;
    this.calculate();
  }

  public posToValue(pos: number): number {
    const exp = (pos / this.axisLength) * (this.maxExp - this.minExp);
    return this.logBase ** exp;
  }

  public valueToPos(value: Primitive): number {
    return this.valueToPercent(value) * this.axisLength;
  }

  public valueToPercent(value: Primitive): number {
    if (!isNumber(value)) return 0;
    const exp = this.log(value) / this.denominator;
    return (exp - this.minExp) / (this.maxExp - this.minExp);
  }

  protected calculate(): void {
    this.log = this.logBase === 10 ? Math.log10 : this.logBase === 2 ? Math.log2 : Math.log;
    this.denominator = this.log === Math.log ? Math.log(this.logBase) : 1;

    this.minExp = Math.floor(this.log(this.minValue) / this.denominator);
    this.maxExp = Math.ceil(this.log(this.maxValue) / this.denominator);
    this.range = this.logBase ** this.maxExp - this.logBase ** this.minExp;
    this.tickSpacing = 1;

    /**
     * For log scale, tick spacing is exp based rather than actual log values.
     * Generate ticks based on `minExp`, `maxExp` and `tickSpacing`.
     * Due to rounding errors, the final tick can get cut off if
     * traversing from `minExp` to `maxExp` with fractional `tickSpacing`.
     * Instead pre-calculate number of ticks and calculate accordingly.
     */
    const count = Math.round((this.maxExp - this.minExp) / this.tickSpacing);
    this.ticks = [];
    this.tickLabels = [];
    for (let i = 0; i <= count; i++) {
      const tickExp = i * this.tickSpacing + this.minExp;
      const tickValue = this.logBase ** tickExp;
      this.ticks.push(tickValue);
      this.tickLabels.push(readableTick(tickValue));
    }

    // Calculate tick positions based on axis length and ticks.
    const offset = this.axisLength / (this.ticks.length - 1);
    this.tickPos = [];
    for (let i = 0; i < this.ticks.length; i++) {
      this.tickPos.push(i * offset);
    }
  }
}

export default LogScale;