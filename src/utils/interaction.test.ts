import * as DEFAULT from '../defaults';
import { ActionType, IX } from '../types';

import { clone } from './data';
import * as utils from './interaction';

describe('interaction utilities', () => {
  describe('getDragBound', () => {
    const dimIndex = 2;
    const bound = { h: 100, w: 100, x: 0, y: 0 };
    const boundOffset = { x: 50, y: 100 };
    let ix: IX;

    beforeEach(() => {
      ix = clone(DEFAULT.IX);
      ix.shared.action.dimIndex = dimIndex;
      ix.dimension.bound = bound;
      ix.dimension.boundOffset = boundOffset;
    });

    it('should get dragging boundary if applicable', () => {
      ix.shared.action.type = ActionType.LabelMove;
      expect(utils.getDragBound(dimIndex, ix, bound)).toStrictEqual({ ...bound, ...boundOffset });
    });

    it('should get default bound if not applicable', () => {
      ix.shared.action.type = ActionType.None;
      expect(utils.getDragBound(dimIndex, ix, bound)).toStrictEqual(bound);
    });
  });

  describe('isFilterEmpty', () => {
    it('should determine if a fiter is empty', () => {
      const filter = { p0: NaN, p1: NaN, value0: NaN, value1: NaN };
      expect(utils.isFilterEmpty(filter)).toBe(true);
    });

    it('should determine if a fiter is not empty', () => {
      const filter0 = { p0: 0.2, p1: 0.6, value0: 20, value1: 60 };
      const filter1 = { p0: NaN, p1: 0.6, value0: 20, value1: 60 };
      const filter2 = { p0: 0.2, p1: NaN, value0: 20, value1: 60 };
      expect(utils.isFilterEmpty(filter0)).toBe(false);
      expect(utils.isFilterEmpty(filter1)).toBe(false);
      expect(utils.isFilterEmpty(filter2)).toBe(false);
    });
  });

  describe('isFilterInvalid', () => {
    it('should determine if a filter is invalid', () => {
      const filter0 = { p0: 0.6, p1: 0.4, value0: 60, value1: 40 };
      const filter1 = { p0: 0.4, p1: 0.4, value0: 40, value1: 40 };
      expect(utils.isFilterInvalid(filter0)).toBe(true);
      expect(utils.isFilterInvalid(filter1)).toBe(true);
    });

    it('should determine if a filter is valid', () => {
      const filter = { p0: 0.4, p1: 0.6, value0: 40, value1: 60 };
      expect(utils.isFilterInvalid(filter)).toBe(false);
    });
  });

  describe('isIntersectingFilters', () => {
    it('should detect if filters are overlapping', () => {
      const filter0 = { p0: 0.2, p1: 0.6, value0: 20, value1: 60 };
      const filter1 = { p0: 0.4, p1: 0.8, value0: 40, value1: 80 };
      expect(utils.isIntersectingFilters(filter0, filter1)).toBe(true);
      expect(utils.isIntersectingFilters(filter1, filter0)).toBe(true);
    });

    it('should detect if filters are not overlapping', () => {
      const filter0 = { p0: 0.2, p1: 0.4, value0: 20, value1: 40 };
      const filter1 = { p0: 0.6, p1: 0.8, value0: 60, value1: 80 };
      expect(utils.isIntersectingFilters(filter0, filter1)).toBe(false);
      expect(utils.isIntersectingFilters(filter1, filter0)).toBe(false);
    });
  });

  describe('mergeFilters', () => {
    it('should merge overlapping filters', () => {
      const filter0 = { p0: 0.2, p1: 0.4, value0: 20, value1: 40 };
      const filter1 = { p0: 0.6, p1: 0.8, value0: 60, value1: 80 };
      const expected = { p0: 0.2, p1: 0.8, value0: 20, value1: 80 };
      expect(utils.mergeFilters(filter0, filter1)).toStrictEqual(expected);
      expect(utils.mergeFilters(filter1, filter0)).toStrictEqual(expected);
    });

    it('should merge non-overlapping filters', () => {
      const filter0 = { p0: 0.2, p1: 0.4, value0: 20, value1: 40 };
      const filter1 = { p0: 0.6, p1: 0.8, value0: 60, value1: 80 };
      const expected = { p0: 0.2, p1: 0.8, value0: 20, value1: 80 };
      expect(utils.mergeFilters(filter0, filter1)).toStrictEqual(expected);
      expect(utils.mergeFilters(filter1, filter0)).toStrictEqual(expected);
    });
  });
});