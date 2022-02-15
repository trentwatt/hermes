/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

function isPlainObject(o) {
  var ctor,prot;

  if (isObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

/**
 * Get the type of the given object.
 *
 * @param object - The object to get the type of.
 * @returns The type of the given object.
 */
function getObjectType(object) {
    if (typeof object !== "object" || object === null) {
        return 0 /* NOT */;
    }
    if (Array.isArray(object)) {
        return 2 /* ARRAY */;
    }
    if (isPlainObject(object)) {
        return 1 /* RECORD */;
    }
    if (object instanceof Set) {
        return 3 /* SET */;
    }
    if (object instanceof Map) {
        return 4 /* MAP */;
    }
    return 5 /* OTHER */;
}
/**
 * Get the keys of the given objects including symbol keys.
 *
 * Note: Only keys to enumerable properties are returned.
 *
 * @param objects - An array of objects to get the keys of.
 * @returns A set containing all the keys of all the given objects.
 */
function getKeys(objects) {
    const keys = new Set();
    /* eslint-disable functional/no-loop-statement -- using a loop here is more efficient. */
    for (const object of objects) {
        for (const key of [
            ...Object.keys(object),
            ...Object.getOwnPropertySymbols(object),
        ]) {
            keys.add(key);
        }
    }
    /* eslint-enable functional/no-loop-statement */
    return keys;
}
/**
 * Does the given object have the given property.
 *
 * @param object - The object to test.
 * @param property - The property to test.
 * @returns Whether the object has the property.
 */
function objectHasProperty(object, property) {
    return (typeof object === "object" &&
        Object.prototype.propertyIsEnumerable.call(object, property));
}
/**
 * Get an iterable object that iterates over the given iterables.
 */
function getIterableOfIterables(iterables) {
    return {
        *[Symbol.iterator]() {
            // eslint-disable-next-line functional/no-loop-statement
            for (const iterable of iterables) {
                // eslint-disable-next-line functional/no-loop-statement
                for (const value of iterable) {
                    yield value;
                }
            }
        },
    };
}

const defaultOptions = {
    mergeMaps,
    mergeSets,
    mergeArrays,
    mergeRecords,
    mergeOthers: leaf,
};
/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
function deepmergeCustom(options) {
    const utils = getUtils(options, customizedDeepmerge);
    /**
     * The customized deepmerge function.
     */
    function customizedDeepmerge(...objects) {
        if (objects.length === 0) {
            return undefined;
        }
        if (objects.length === 1) {
            return objects[0];
        }
        return mergeUnknowns(objects, utils);
    }
    return customizedDeepmerge;
}
/**
 * The the full options with defaults apply.
 *
 * @param options - The options the user specified
 */
function getUtils(options, customizedDeepmerge) {
    return {
        defaultMergeFunctions: defaultOptions,
        mergeFunctions: {
            ...defaultOptions,
            ...Object.fromEntries(Object.entries(options).map(([key, option]) => option === false ? [key, leaf] : [key, option])),
        },
        deepmerge: customizedDeepmerge,
    };
}
/**
 * Merge unknown things.
 *
 * @param values - The values.
 */
function mergeUnknowns(values, utils) {
    const type = getObjectType(values[0]);
    // eslint-disable-next-line functional/no-conditional-statement -- add an early escape for better performance.
    if (type !== 0 /* NOT */ && type !== 5 /* OTHER */) {
        // eslint-disable-next-line functional/no-loop-statement -- using a loop here is more performant than mapping every value and then testing every value.
        for (let mutableIndex = 1; mutableIndex < values.length; mutableIndex++) {
            if (getObjectType(values[mutableIndex]) === type) {
                continue;
            }
            return utils.mergeFunctions.mergeOthers(values, utils);
        }
    }
    switch (type) {
        case 1 /* RECORD */:
            return utils.mergeFunctions.mergeRecords(values, utils);
        case 2 /* ARRAY */:
            return utils.mergeFunctions.mergeArrays(values, utils);
        case 3 /* SET */:
            return utils.mergeFunctions.mergeSets(values, utils);
        case 4 /* MAP */:
            return utils.mergeFunctions.mergeMaps(values, utils);
        default:
            return utils.mergeFunctions.mergeOthers(values, utils);
    }
}
/**
 * Merge records.
 *
 * @param values - The records.
 */
function mergeRecords(values, utils) {
    const result = {};
    /* eslint-disable functional/no-loop-statement, functional/no-conditional-statement -- using a loop here is more performant. */
    for (const key of getKeys(values)) {
        const propValues = [];
        for (const value of values) {
            if (objectHasProperty(value, key)) {
                propValues.push(value[key]);
            }
        }
        // assert(propValues.length > 0);
        result[key] =
            propValues.length === 1
                ? propValues[0]
                : mergeUnknowns(propValues, utils);
    }
    /* eslint-enable functional/no-loop-statement, functional/no-conditional-statement */
    return result;
}
/**
 * Merge arrays.
 *
 * @param values - The arrays.
 */
function mergeArrays(values, utils) {
    return values.flat();
}
/**
 * Merge sets.
 *
 * @param values - The sets.
 */
function mergeSets(values, utils) {
    return new Set(getIterableOfIterables(values));
}
/**
 * Merge maps.
 *
 * @param values - The maps.
 */
function mergeMaps(values, utils) {
    return new Map(getIterableOfIterables(values));
}
/**
 * Merge "other" things.
 *
 * @param values - The values.
 */
function leaf(values, utils) {
    return values[values.length - 1];
}

const isError = (data) => data instanceof Error;
const isNumber = (data) => typeof data === 'number';
const isString = (data) => typeof data === 'string';
const clone = (data) => {
    return JSON.parse(JSON.stringify(data));
};
const capDataRange = (data, range) => {
    return Math.min(range[1], Math.max(range[0], data));
};
const getDataRange = (data) => {
    return data.reduce((acc, x) => {
        if (isNumber(x)) {
            if (x > acc[1])
                acc[1] = x;
            if (x < acc[0])
                acc[0] = x;
        }
        return acc;
    }, [Infinity, -Infinity]);
};

const readableNumber = (num, precision = 6) => {
    let readable = num.toString();
    if (isNaN(num)) {
        readable = 'NaN';
    }
    else if (!Number.isFinite(num)) {
        readable = `${num < 0 ? '-' : ''}Infinity`;
    }
    else if (!Number.isInteger(num)) {
        readable = num.toFixed(precision);
        const absoluteNum = Math.abs(num);
        if (absoluteNum < 0.01 || absoluteNum > 999) {
            readable = num.toExponential(precision);
        }
    }
    return readable;
};
const readableTick = (num) => {
    let readable = readableNumber(num);
    readable = readable.replace(/(\.[0-9]+?)0+(e-?\d+)?$/, '$1$2'); // e.g. 0.750000 => 0.75
    readable = readable.replace(/\.(e)/, '$1'); // e.g. 2.e5 => 2e5
    return readable;
};
const value2str = (value) => {
    return isString(value) ? value : value.toString();
};

/**
 * NiceScale solves the problem of generating human friendly ticks for chart axes.
 * Normal generative tick techniques make tick marks that jarring for the human to read.
 *
 * https://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
 */
const DEFAULT_DATA_ON_EDGE = true;
const MIN_TICK_DISTANCE = 50;
class NiceScale {
    /**
     * Instantiates a new instance of the NiceScale class.
     *
     * @param minValue the minimum data point on the axis
     * @param maxValue the maximum data point on the axis
     * @param maxTicks the maximum number of tick marks for the axis
     */
    constructor(minValue, maxValue, dataOnEdge = DEFAULT_DATA_ON_EDGE) {
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.dataOnEdge = dataOnEdge;
        this.range = 0;
        this.tickLabels = [];
        this.tickPos = [];
        this.ticks = [];
        this.tickPadding = 0;
        this.tickSpacing = 0;
        this.axisLength = 1;
        this.maxTicks = 1;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.max = maxValue;
        this.min = minValue;
    }
    setAxisLength(axisLength) {
        this.axisLength = axisLength;
        this.maxTicks = axisLength / MIN_TICK_DISTANCE;
        this.calculate();
    }
    setMinMaxValues(minValue, maxValue) {
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.calculate();
    }
    /**
     * Returns a "nice" number approximately equal to range.
     * Rounds the number if round = true
     * Takes the ceiling if round = false.
     *
     * @param range the data range
     * @param round whether to round the result
     * @return a "nice" number to be used for the data range
     */
    niceNum(range, round) {
        const exponent = Math.floor(Math.log10(range)); // Exponent of range.
        const fraction = range / 10 ** exponent; // Fractional part of range.
        let niceFraction; // Nice, rounded fraction.
        if (round) {
            if (fraction < 1.5)
                niceFraction = 1;
            else if (fraction < 3)
                niceFraction = 2;
            else if (fraction < 7)
                niceFraction = 5;
            else
                niceFraction = 10;
        }
        else {
            if (fraction <= 1)
                niceFraction = 1;
            else if (fraction <= 2)
                niceFraction = 2;
            else if (fraction <= 5)
                niceFraction = 5;
            else
                niceFraction = 10;
        }
        return niceFraction * 10 ** exponent;
    }
}

class CategoricalScale extends NiceScale {
    constructor(categories = [], dataOnEdge = DEFAULT_DATA_ON_EDGE) {
        super(0, 0, dataOnEdge);
        this.categories = categories;
        this.dataOnEdge = dataOnEdge;
        this.tickLabels = this.categories.map(category => value2str(category));
    }
    percentToValue(percent) {
        return this.posToValue(percent * this.axisLength);
    }
    posToValue(pos) {
        let distance = Infinity;
        let value = Number.NaN;
        for (let i = 0; i < this.tickPos.length; i++) {
            const tickPos = this.tickPos[i];
            const dp = Math.abs(pos - tickPos);
            if (dp < distance) {
                distance = dp;
                value = this.categories[i];
            }
        }
        return value;
    }
    valueToPercent(value) {
        const stringValue = value2str(value);
        const index = this.tickLabels.findIndex(label => label === stringValue);
        if (index !== -1)
            return this.tickPos[index] / this.axisLength;
        return 0;
    }
    valueToPos(value) {
        const stringValue = value2str(value);
        const index = this.tickLabels.findIndex(label => label === stringValue);
        if (index !== -1)
            return this.tickPos[index];
        return 0;
    }
    calculate() {
        // Calculate tick positions based on axis length and ticks.
        const count = this.tickLabels.length;
        let traversed = 0;
        this.tickSpacing = this.axisLength / (this.dataOnEdge ? count - 1 : count);
        this.tickPos = [];
        for (let i = 0; i < count; i++) {
            if ([0, count].includes(i)) {
                traversed += this.dataOnEdge ? 0 : this.tickSpacing / 2;
            }
            else {
                traversed += this.tickSpacing;
            }
            this.tickPos.push(traversed);
        }
    }
}

const MESSAGE_PREFIX = '[Hermes]';
const DEFAULT_MESSAGE = 'Critical error encountered!';
class HermesError extends Error {
    constructor(e) {
        const message = isError(e) ? e.message : (isString(e) ? e : DEFAULT_MESSAGE);
        super(`${MESSAGE_PREFIX} ${message}`);
    }
}

class LinearScale extends NiceScale {
    percentToValue(percent) {
        const min = this.dataOnEdge ? this.minValue : this.min;
        const max = this.dataOnEdge ? this.maxValue : this.max;
        return percent * (max - min) + min;
    }
    posToValue(pos) {
        const min = this.dataOnEdge ? this.minValue : this.min;
        const max = this.dataOnEdge ? this.maxValue : this.max;
        return (pos / this.axisLength) * (max - min) + min;
    }
    valueToPercent(value) {
        if (!isNumber(value))
            return 0;
        const min = this.dataOnEdge ? this.minValue : this.min;
        const max = this.dataOnEdge ? this.maxValue : this.max;
        return (value - min) / (max - min);
    }
    valueToPos(value) {
        return this.valueToPercent(value) * this.axisLength;
    }
    calculate() {
        this.range = this.niceNum(this.maxValue - this.minValue, false);
        this.tickSpacing = this.niceNum(this.range / this.maxTicks, true);
        this.min = Math.floor(this.minValue / this.tickSpacing) * this.tickSpacing;
        this.max = Math.ceil(this.maxValue / this.tickSpacing) * this.tickSpacing;
        /**
         * Generate ticks based on min, max and tick spacing.
         * Due to rounding errors, the final tick can get cut off if
         * traversing from `min` to `max` with fractional `tickSpacing`.
         * Instead pre-calculate number of ticks and calculate accordingly.
         */
        const count = Math.round((this.max - this.min) / this.tickSpacing);
        this.ticks = [];
        this.tickLabels = [];
        for (let i = 0; i <= count; i++) {
            let tick = i * this.tickSpacing + this.min;
            if (this.dataOnEdge && i === 0)
                tick = this.minValue;
            if (this.dataOnEdge && i === count)
                tick = this.maxValue;
            this.ticks.push(tick);
            let tickLabel = readableTick(tick);
            if (this.dataOnEdge && [0, count].includes(i))
                tickLabel = `*${tickLabel}`;
            this.tickLabels.push(tickLabel);
        }
        // Calculate tick positions based on axis length and ticks.
        this.tickPos = this.ticks.map(tick => this.valueToPos(tick));
    }
}

const DEFAULT_LOG_BASE = 10;
class LogScale extends NiceScale {
    constructor(minValue, maxValue, logBase = DEFAULT_LOG_BASE, dataOnEdge = DEFAULT_DATA_ON_EDGE) {
        super(minValue, maxValue, dataOnEdge);
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.logBase = logBase;
        this.dataOnEdge = dataOnEdge;
        this.maxExp = Number.NaN;
        this.maxExpExact = Number.NaN;
        this.minExp = Number.NaN;
        this.minExpExact = Number.NaN;
        this.denominator = 1;
        this.log = Math.log;
        this.logBase = logBase;
    }
    setMinMaxValues(minValue, maxValue, logBase = DEFAULT_LOG_BASE) {
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.logBase = logBase;
        this.calculate();
    }
    percentToValue(percent) {
        const exp = percent * this.rangeExp();
        return this.logBase ** exp;
    }
    posToValue(pos) {
        const exp = (pos / this.axisLength) * this.rangeExp();
        return this.logBase ** exp;
    }
    valueToPos(value) {
        return this.valueToPercent(value) * this.axisLength;
    }
    valueToPercent(value) {
        if (!isNumber(value))
            return 0;
        const exp = this.log(value) / this.denominator;
        if (this.dataOnEdge)
            return (exp - this.minExpExact) / (this.maxExpExact - this.minExpExact);
        return (exp - this.minExp) / (this.maxExp - this.minExp);
    }
    rangeExp() {
        return this.dataOnEdge ? this.maxExpExact - this.minExpExact : this.maxExp - this.minExp;
    }
    calculate() {
        this.log = this.logBase === 10 ? Math.log10 : this.logBase === 2 ? Math.log2 : Math.log;
        this.denominator = this.log === Math.log ? Math.log(this.logBase) : 1;
        this.minExpExact = this.log(this.minValue) / this.denominator;
        this.maxExpExact = this.log(this.maxValue) / this.denominator;
        this.minExp = Math.floor(this.minExpExact);
        this.maxExp = Math.ceil(this.maxExpExact);
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
            let tickValue = this.logBase ** tickExp;
            if (this.dataOnEdge && i === 0)
                tickValue = this.logBase ** this.minExpExact;
            if (this.dataOnEdge && i === count)
                tickValue = this.logBase ** this.maxExpExact;
            this.ticks.push(tickValue);
            let tickLabel = readableTick(tickValue);
            if (this.dataOnEdge && [0, count].includes(i))
                tickLabel = `*${tickLabel}`;
            this.tickLabels.push(tickLabel);
        }
        // Calculate tick positions based on axis length and ticks.
        this.tickPos = this.ticks.map(tick => this.valueToPos(tick));
    }
}

/**
 * ENUMERABLES
 */
var ActionType;
(function (ActionType) {
    ActionType["FilterCreate"] = "filter-create";
    ActionType["FilterMove"] = "filter-move";
    ActionType["FilterResizeAfter"] = "filter-resize-after";
    ActionType["FilterResizeBefore"] = "filter-resize-before";
    ActionType["LabelMove"] = "label-move";
    ActionType["None"] = "none";
})(ActionType || (ActionType = {}));
var AxisType;
(function (AxisType) {
    AxisType["Categorical"] = "categorical";
    AxisType["Linear"] = "linear";
    AxisType["Logarithmic"] = "logarithmic";
})(AxisType || (AxisType = {}));
var DimensionLayout;
(function (DimensionLayout) {
    DimensionLayout["AxisEvenlySpaced"] = "axis-evenly-spaced";
    DimensionLayout["Equidistant"] = "equidistant";
    DimensionLayout["EvenlySpaced"] = "evenly-spaced";
})(DimensionLayout || (DimensionLayout = {}));
var Direction;
(function (Direction) {
    Direction["Horizontal"] = "horizontal";
    Direction["Vertical"] = "vertical";
})(Direction || (Direction = {}));
var FocusType;
(function (FocusType) {
    FocusType["DimensionLabel"] = "dimension-label";
    FocusType["DimensionAxis"] = "dimension-axis";
    FocusType["Filter"] = "filter";
    FocusType["FilterResize"] = "filter-resize";
})(FocusType || (FocusType = {}));
var LabelPlacement;
(function (LabelPlacement) {
    LabelPlacement["After"] = "after";
    LabelPlacement["Before"] = "before";
})(LabelPlacement || (LabelPlacement = {}));
var PathType;
(function (PathType) {
    PathType["Bezier"] = "bezier";
    PathType["Straight"] = "straight";
})(PathType || (PathType = {}));

/**
 * Invalid defaults.
 */
const INVALID_VALUE = Number.NaN;
const INVALID_POINT = { x: Number.NaN, y: Number.NaN };
const INVALID_RECT = { h: Number.NaN, w: Number.NaN, x: Number.NaN, y: Number.NaN };
const INVALID_ACTION = {
    dimIndex: -1,
    p0: INVALID_POINT,
    p1: INVALID_POINT,
    type: ActionType.None,
};
/**
 * Style defaults.
 */
const BEZIER_FACTOR = 0.3;
const DIRECTION = 'inherit';
const FILL_STYLE = 'black';
const FONT = 'normal 12px san-serif';
const LINE_CAP = 'butt';
const LINE_DASH_OFFSET = 0.0;
const LINE_JOIN = 'round';
const LINE_WIDTH = 1.0;
const MITER_LIMIT = 10.0;
const STROKE_STYLE = 'black';
const TEXT_BASELINE = 'middle';
/**
 * Framework options defaults.
 */
const HERMES_OPTIONS = {
    direction: Direction.Horizontal,
    style: {
        axes: {
            axis: {
                boundaryPadding: 15,
                lineWidth: 1,
                strokeStyle: 'rgba(147, 147, 147, 1.0)',
            },
            axisActve: { strokeStyle: 'rgba(255, 100, 0, 1.0)' },
            axisHover: { strokeStyle: 'rgba(147, 147, 147, 1.0)' },
            filter: {
                cornerRadius: 2,
                fillStyle: 'rgba(0, 0, 0, 1.0)',
                strokeStyle: 'rgba(255, 255, 255, 1.0)',
                width: 4,
            },
            filterActive: {
                cornerRadius: 3,
                fillStyle: 'rgba(255, 100, 0, 1.0)',
                width: 6,
            },
            filterHover: {
                cornerRadius: 2,
                fillStyle: 'rgba(200, 50, 0, 1.0)',
                width: 4,
            },
            label: {
                fillStyle: 'rgba(0, 0, 0, 1.0)',
                font: 'normal 11px sans-serif',
                lineWidth: 3,
                offset: 4,
                placement: LabelPlacement.Before,
                strokeStyle: 'rgba(255, 255, 255, 1.0)',
            },
            labelActive: { fillStyle: 'rgba(0, 0, 0, 1.0)' },
            labelHover: { fillStyle: 'rgba(0, 0, 0, 1.0)' },
            tick: {
                length: 4,
                lineWidth: 1,
                strokeStyle: 'rgba(147, 147, 147, 1.0)',
            },
            tickActive: { strokeStyle: 'rgba(255, 100, 0, 1.0)' },
            tickHover: { strokeStyle: 'rgba(147, 147, 147, 1.0)' },
        },
        data: {
            default: {
                lineWidth: 1,
                strokeStyle: 'rgba(82, 144, 244, 1.0)',
            },
            filtered: {
                lineWidth: 1,
                strokeStyle: 'rgba(0, 0, 0, 0.05)',
            },
            path: {
                options: {},
                type: PathType.Straight,
            },
        },
        dimension: {
            label: {
                angle: undefined,
                boundaryPadding: 5,
                fillStyle: 'rgba(0, 0, 0, 1.0)',
                font: 'normal 11px sans-serif',
                lineWidth: 3,
                offset: 16,
                placement: LabelPlacement.Before,
                strokeStyle: 'rgba(255, 255, 255, 1.0)',
            },
            labelActive: { fillStyle: 'rgba(82, 144, 244, 1.0)' },
            labelHover: { fillStyle: 'rgba(82, 144, 244, 1.0)' },
            layout: DimensionLayout.AxisEvenlySpaced,
        },
        padding: [32, 16, 32, 16],
    },
};
const FILTER = {
    p0: Number.NaN,
    p1: Number.NaN,
    value0: Number.NaN,
    value1: Number.NaN,
};
const IX = {
    dimension: {
        axis: 0,
        bound: undefined,
        boundOffset: undefined,
        offset: 0,
    },
    filters: {
        active: FILTER,
        key: undefined,
    },
    shared: {
        action: INVALID_ACTION,
        focus: undefined,
    },
};

const distance = (pointA, pointB) => {
    return Math.sqrt((pointB.x - pointA.x) ** 2 + (pointB.y - pointA.y) ** 2);
};
const rotatePoint = (x, y, rad, px = 0, py = 0) => {
    const dx = (x - px);
    const dy = (y - py);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
        x: cos * dx - sin * dy + px,
        y: sin * dx + cos * dy + py,
    };
};
const dotProduct = (v0, v1) => {
    return v0.x * v1.x + v0.y * v1.y;
};
/**
 * Barycentric Technique on determining if a point is within a triangle.
 * https://blackpawn.com/texts/pointinpoly/default.html
 */
const isPointInTriangle = (p, a, b, c) => {
    // Compute vectors.
    const v0 = { x: c.x - a.x, y: c.y - a.y };
    const v1 = { x: b.x - a.x, y: b.y - a.y };
    const v2 = { x: p.x - a.x, y: p.y - a.y };
    // Compute dot products.
    const dot00 = dotProduct(v0, v0);
    const dot01 = dotProduct(v0, v1);
    const dot02 = dotProduct(v0, v2);
    const dot11 = dotProduct(v1, v1);
    const dot12 = dotProduct(v1, v2);
    // Compute barycentric coordinates.
    const inverseDenominator = 1 / (dot00 * dot11 - dot01 * dot01);
    const u = (dot11 * dot02 - dot01 * dot12) * inverseDenominator;
    const v = (dot00 * dot12 - dot01 * dot02) * inverseDenominator;
    // Check if the point is in the triangle.
    return u >= 0 && v >= 0 && u + v < 1;
};
const shiftRect = (rect, shift) => {
    return { h: rect.h, w: rect.w, x: rect.x + shift.x, y: rect.y + shift.y };
};

const drawBoundary = (ctx, boundary, style = {}) => {
    ctx.save();
    if (ctx.fillStyle) {
        ctx.fillStyle = (style === null || style === void 0 ? void 0 : style.fillStyle) || '';
        ctx.beginPath();
        ctx.moveTo(boundary[0].x, boundary[0].y);
        for (let i = 1; i < boundary.length; i++) {
            ctx.lineTo(boundary[i].x, boundary[i].y);
        }
        ctx.closePath();
        ctx.fill();
    }
    if (ctx.strokeStyle) {
        ctx.lineCap = style.lineCap || LINE_CAP;
        ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
        ctx.lineJoin = style.lineJoin || LINE_JOIN;
        ctx.lineWidth = style.lineWidth || LINE_WIDTH;
        ctx.miterLimit = style.miterLimit || MITER_LIMIT;
        ctx.strokeStyle = style.strokeStyle || STROKE_STYLE;
        ctx.beginPath();
        ctx.moveTo(boundary[0].x, boundary[0].y);
        for (let i = 1; i < boundary.length; i++) {
            ctx.lineTo(boundary[i].x, boundary[i].y);
        }
        ctx.closePath();
        ctx.stroke();
    }
    ctx.restore();
};
const drawCircle = (ctx, x, y, radius, style = {}) => {
    ctx.save();
    if (ctx.fillStyle) {
        ctx.fillStyle = (style === null || style === void 0 ? void 0 : style.fillStyle) || '';
        ctx.moveTo(x + radius, y);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }
    if (ctx.strokeStyle) {
        ctx.lineCap = style.lineCap || LINE_CAP;
        ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
        ctx.lineJoin = style.lineJoin || LINE_JOIN;
        ctx.lineWidth = style.lineWidth || LINE_WIDTH;
        ctx.miterLimit = style.miterLimit || MITER_LIMIT;
        ctx.strokeStyle = style.strokeStyle || STROKE_STYLE;
        ctx.moveTo(x + radius, y);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
    ctx.restore();
};
const drawData = (ctx, data, isHorizontal, path, style = {}) => {
    var _a;
    if (data.length < 2)
        return;
    ctx.save();
    ctx.lineCap = style.lineCap || LINE_CAP;
    ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
    ctx.lineJoin = style.lineJoin || LINE_JOIN;
    ctx.lineWidth = style.lineWidth || LINE_WIDTH;
    ctx.miterLimit = style.miterLimit || MITER_LIMIT;
    ctx.strokeStyle = style.strokeStyle || STROKE_STYLE;
    ctx.beginPath();
    ctx.moveTo(data[0].x, data[0].y);
    const bezierFactor = (_a = path.options.bezierFactor) !== null && _a !== void 0 ? _a : BEZIER_FACTOR;
    for (let i = 1; i < data.length; i++) {
        const [x1, y1] = [data[i].x, data[i].y];
        if (path.type === PathType.Straight) {
            ctx.lineTo(x1, y1);
        }
        else if (path.type === PathType.Bezier) {
            const [x0, y0] = [data[i - 1].x, data[i - 1].y];
            const [cp0x, cp0y] = [
                x0 + (isHorizontal ? (x1 - x0) * bezierFactor : 0),
                y0 + (isHorizontal ? 0 : (y1 - y0) * bezierFactor),
            ];
            const [cp1x, cp1y] = [
                x1 - (isHorizontal ? (x1 - x0) * bezierFactor : 0),
                y1 - (isHorizontal ? 0 : (y1 - y0) * bezierFactor),
            ];
            ctx.bezierCurveTo(cp0x, cp0y, cp1x, cp1y, x1, y1);
        }
    }
    ctx.stroke();
    ctx.restore();
};
const drawLine = (ctx, x0, y0, x1, y1, style = {}) => {
    ctx.save();
    ctx.lineCap = style.lineCap || LINE_CAP;
    ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
    ctx.lineJoin = style.lineJoin || LINE_JOIN;
    ctx.lineWidth = style.lineWidth || LINE_WIDTH;
    ctx.miterLimit = style.miterLimit || MITER_LIMIT;
    ctx.strokeStyle = style.strokeStyle || STROKE_STYLE;
    ctx.beginPath();
    ctx.moveTo(roundPixel(x0), roundPixel(y0));
    ctx.lineTo(roundPixel(x1), roundPixel(y1));
    ctx.stroke();
    ctx.restore();
};
const drawRect = (ctx, x, y, w, h, style = {}) => {
    ctx.save();
    const rx = roundPixel(x);
    const ry = roundPixel(y);
    const radius = style.cornerRadius || 0;
    if (style.fillStyle) {
        ctx.fillStyle = style.fillStyle || FILL_STYLE;
        if (radius === 0) {
            ctx.fillRect(rx, ry, w, h);
        }
        else {
            drawRoundedRect(ctx, rx, ry, w, h, radius);
            ctx.fill();
        }
    }
    if (style.strokeStyle) {
        ctx.lineCap = style.lineCap || LINE_CAP;
        ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
        ctx.lineJoin = style.lineJoin || LINE_JOIN;
        ctx.lineWidth = style.lineWidth || LINE_WIDTH;
        ctx.miterLimit = style.miterLimit || MITER_LIMIT;
        ctx.strokeStyle = style.strokeStyle || STROKE_STYLE;
        if (radius === 0) {
            ctx.strokeRect(rx, ry, w, h);
        }
        else {
            drawRoundedRect(ctx, rx, ry, w, h, radius);
            ctx.stroke();
        }
    }
    ctx.restore();
};
const drawRoundedRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
};
const drawText = (ctx, text, x, y, rad, style = {}) => {
    const normalizedRad = normalizeRad(rad);
    const inwards = normalizedRad > Math.PI / 2 && normalizedRad <= 3 * Math.PI / 2;
    ctx.save();
    ctx.direction = style.direction || DIRECTION;
    ctx.font = style.font || FONT;
    ctx.textAlign = style.textAlign || (inwards ? 'right' : 'left');
    ctx.textBaseline = style.textBaseline || TEXT_BASELINE;
    ctx.translate(x, y);
    ctx.rotate(-rad - (inwards ? Math.PI : 0));
    ctx.translate(-x, -y);
    if (style.strokeStyle) {
        ctx.lineCap = style.lineCap || LINE_CAP;
        ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
        ctx.lineJoin = style.lineJoin || LINE_JOIN;
        ctx.lineWidth = style.lineWidth || LINE_WIDTH;
        ctx.miterLimit = style.miterLimit || MITER_LIMIT;
        ctx.strokeStyle = style.strokeStyle || STROKE_STYLE;
        ctx.strokeText(text, x, y);
    }
    if (style.fillStyle) {
        ctx.fillStyle = style.fillStyle || FILL_STYLE;
        ctx.fillText(text, x, y);
    }
    ctx.restore();
};
const getTextBoundary = (x, y, w, h, rad, offsetX = 0, offsetY = 0, padding = 0) => {
    const x0 = x + offsetX - padding;
    const y0 = y + offsetY - padding;
    const x1 = x + w + offsetX + padding;
    const y1 = y + h + offsetY + padding;
    const boundary = [
        { x: x0, y: y0 },
        { x: x1, y: y0 },
        { x: x1, y: y1 },
        { x: x0, y: y1 },
    ];
    if (rad != null) {
        const normalizedRad = normalizeRad(rad);
        return boundary.map(point => rotatePoint(point.x, point.y, -normalizedRad, x, y));
    }
    return boundary;
};
const getTextSize = (ctx, text, font = FONT) => {
    ctx.font = font;
    const metrics = ctx.measureText(text);
    const w = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const h = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    return { h, w };
};
const normalizePadding = (padding) => {
    if (!Array.isArray(padding))
        return [padding, padding, padding, padding];
    if (padding.length === 2)
        return [padding[0], padding[1], padding[0], padding[1]];
    return padding;
};
const normalizeRad = (rad) => {
    return (rad + 2 * Math.PI) % (2 * Math.PI);
};
/**
 * To produce crisp lines on canvas, the line coordinates need to sit on the half pixel.
 * https://stackoverflow.com/a/13879402/5402432
 */
const roundPixel = (x) => {
    return Math.round(x - 0.5) + 0.5;
};

const hex2rgb = (hex) => {
    const rgb = { b: 0, g: 0, r: 0 };
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result && result.length > 3) {
        rgb.r = parseInt(result[1], 16);
        rgb.g = parseInt(result[2], 16);
        rgb.b = parseInt(result[3], 16);
    }
    return rgb;
};
const rgba2str = (rgba) => {
    if (rgba.a != null) {
        return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
    }
    return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
};
const rgbaFromGradient = (rgba0, rgba1, percent) => {
    const r = Math.round((rgba1.r - rgba0.r) * percent + rgba0.r);
    const g = Math.round((rgba1.g - rgba0.g) * percent + rgba0.g);
    const b = Math.round((rgba1.b - rgba0.b) * percent + rgba0.b);
    if (rgba0.a != null && rgba1.a != null) {
        const a = (rgba1.a - rgba0.a) * percent + rgba0.a;
        return { a, b, g, r };
    }
    return { b, g, r };
};
const scale2rgba = (colors, percent) => {
    const count = colors.length;
    if (count < 1)
        return '#000000';
    if (count === 1)
        return colors[0];
    const index = percent * (count - 1);
    const i0 = Math.floor(index);
    const i1 = Math.ceil(index);
    const color0 = str2rgba(colors[i0]);
    const color1 = str2rgba(colors[i1]);
    const rgba = rgbaFromGradient(color0, color1, index - i0);
    return rgba2str(rgba);
};
const str2rgba = (str) => {
    if (/^#/.test(str))
        return hex2rgb(str);
    const regex = /^rgba?\(\s*?(\d+)\s*?,\s*?(\d+)\s*?,\s*?(\d+)\s*?(,\s*?([\d.]+)\s*?)?\)$/i;
    const result = regex.exec(str);
    if (result && result.length > 3) {
        const rgba = { a: 1.0, b: 0, g: 0, r: 0 };
        rgba.r = parseInt(result[1]);
        rgba.g = parseInt(result[2]);
        rgba.b = parseInt(result[3]);
        if (result.length > 5)
            rgba.a = parseFloat(result[5]);
        return rgba;
    }
    return { a: 0.0, b: 0, g: 0, r: 0 };
};

const getElement = (target) => {
    if (!isString(target))
        return target;
    return document.querySelector(target);
};

const DIMENSION_SWAP_THRESHOLD = 30;
const FILTER_REMOVE_THRESHOLD = 1;
const FILTER_RESIZE_THRESHOLD = 3;
const getDragBound = (index, ix, bound) => {
    const action = ix.shared.action;
    const isLabelDrag = action.type === ActionType.LabelMove && action.dimIndex === index;
    const dragBound = ix.dimension.bound || INVALID_RECT;
    const offset = ix.dimension.boundOffset || { x: 0, y: 0 };
    return isLabelDrag ? shiftRect(dragBound, offset) : bound;
};
const isFilterEmpty = (filter) => {
    return isNaN(filter.p0) && isNaN(filter.p1);
};
const isFilterInvalid = (filter) => {
    return filter.p0 >= filter.p1;
};
const isIntersectingFilters = (filter0, filter1) => {
    return filter0.p0 <= filter1.p1 && filter1.p0 <= filter0.p1;
};
const mergeFilters = (filter0, filter1) => {
    const newFilter = clone(FILTER);
    if (filter0.p0 < filter1.p0) {
        newFilter.p0 = filter0.p0;
        newFilter.value0 = filter0.value0;
    }
    else {
        newFilter.p0 = filter1.p0;
        newFilter.value0 = filter1.value0;
    }
    if (filter0.p1 > filter1.p1) {
        newFilter.p1 = filter0.p1;
        newFilter.value1 = filter0.value1;
    }
    else {
        newFilter.p1 = filter1.p1;
        newFilter.value1 = filter1.value1;
    }
    return newFilter;
};

const scale = new LinearScale(0, 100);
const dimensionRanges = {
    'accuracy': [0.55, 0.99],
    'dropout': [0.2, 0.8],
    'global-batch-size': [5, 30],
    'layer-split-factor': [1, 16],
    'learning-rate': [0.0001, 0.1],
    'learning-rate-decay': [0.000001, 0.001],
    'loss': [1.7, 2.4],
    'metrics-base': [0.5, 0.9],
    'n-filters': [8, 64],
};
const dimensionSamples = [
    {
        axis: { scale, type: AxisType.Linear },
        key: 'dropout',
        label: 'Dropout',
    },
    {
        axis: { scale, type: AxisType.Linear },
        key: 'global-batch-size',
        label: 'Global Batch Size',
    },
    {
        axis: {
            categories: [4, 8, 16, 32, 64],
            dataOnEdge: false,
            scale,
            type: AxisType.Categorical,
        },
        key: 'layer-dense-size',
        label: 'Layer Dense Size',
    },
    {
        axis: { categories: [true, false], dataOnEdge: false, scale, type: AxisType.Categorical },
        key: 'layer-inverse',
        label: 'Layer Inverse',
    },
    {
        axis: { logBase: 10, scale, type: AxisType.Logarithmic },
        key: 'learning-rate',
        label: 'Learning Rate',
    },
    {
        axis: { logBase: 10, scale, type: AxisType.Logarithmic },
        key: 'learning-rate-decay',
        label: 'Learning Rate Decay',
    },
    {
        axis: { logBase: 2, scale, type: AxisType.Logarithmic },
        key: 'layer-split-factor',
        label: 'Layer Split Factor',
    },
    {
        axis: { scale, type: AxisType.Linear },
        key: 'metrics-base',
        label: 'Metrics Base',
    },
    {
        axis: { scale, type: AxisType.Linear },
        key: 'n-filters',
        label: 'N Filters',
    },
];
const metricDimensionSamples = [
    {
        axis: { scale, type: AxisType.Linear },
        key: 'accuracy',
        label: 'Accuracy',
    },
    {
        axis: { scale, type: AxisType.Linear },
        key: 'loss',
        label: 'Loss',
    },
];
const generateData = (dimensions, count) => {
    return dimensions.reduce((acc, dimension) => {
        const axis = dimension.axis;
        acc[dimension.key] = new Array(count).fill(null).map(() => {
            if (axis.type === AxisType.Categorical) {
                return axis.categories ? randomItem(axis.categories) : INVALID_VALUE;
            }
            else if (axis.type === AxisType.Linear) {
                const range = dimensionRanges[dimension.key];
                return range ? randomNumber(range[1], range[0]) : INVALID_VALUE;
            }
            else if (axis.type === AxisType.Logarithmic) {
                const range = dimensionRanges[dimension.key];
                return range && axis.logBase
                    ? randomLogNumber(axis.logBase, range[1], range[0]) : INVALID_VALUE;
            }
            return INVALID_VALUE;
        });
        return acc;
    }, {});
};
const generateDimensions = (dimCount = 10, random = true) => {
    // Generate the dimensions based on config.
    const dims = new Array(dimCount - 1).fill(null).map((_, index) => {
        if (random)
            return randomItem(dimensionSamples);
        return dimensionSamples[index % dimensionSamples.length];
    });
    // Add a metric dimension to the end.
    dims.push(randomItem(metricDimensionSamples));
    return dims;
};
const randomInt = (max, min = 0) => {
    return Math.floor(Math.random() * (max - min)) + min;
};
const randomItem = (list) => {
    return list[randomInt(list.length)];
};
const randomLogNumber = (base, max, min) => {
    const log = base === 10 ? Math.log10 : base === 2 ? Math.log2 : Math.log;
    const denominator = log === Math.log ? Math.log(base) : 1;
    const maxExp = log(max) / denominator;
    const minExp = log(min) / denominator;
    return base ** randomNumber(maxExp, minExp);
};
const randomNumber = (max, min) => {
    return Math.random() * (max - min) + min;
};

var tester = /*#__PURE__*/Object.freeze({
  __proto__: null,
  generateData: generateData,
  generateDimensions: generateDimensions,
  randomInt: randomInt,
  randomItem: randomItem,
  randomLogNumber: randomLogNumber,
  randomNumber: randomNumber
});

const customDeepmerge = deepmergeCustom({ mergeArrays: false });
class Hermes {
    constructor(target, data, dimensions, options = {}) {
        this.size = { h: 0, w: 0 };
        this.ix = clone(IX);
        this.filters = {};
        this._ = undefined;
        const element = getElement(target);
        if (!element)
            throw new HermesError('Target element selector did not match anything.');
        this.element = element;
        // Create a canvas and append it to the target element.
        this.canvas = document.createElement('canvas');
        this.element.appendChild(this.canvas);
        // Setup initial canvas size.
        const rect = this.element.getBoundingClientRect();
        this.setSize(rect.width, rect.height);
        // Get canvas context.
        const ctx = this.canvas.getContext('2d');
        if (!ctx)
            throw new HermesError('Unable to get context from target element.');
        this.ctx = ctx;
        // Must have at least one dimension data available.
        if (Object.keys(data).length === 0)
            throw new HermesError('Need at least one dimension data record.');
        // All the dimension data should be equal in size.
        this.dataCount = 0;
        Object.values(data).forEach((dimData, i) => {
            if (i === 0) {
                this.dataCount = dimData.length;
            }
            else if (this.dataCount !== dimData.length) {
                throw new HermesError('The dimension data are not all identical in size.');
            }
        });
        this.data = data;
        if (dimensions.length === 0)
            throw new HermesError('Need at least one dimension defined.');
        this.dimensions = dimensions;
        this.dimensionsOriginal = clone(dimensions);
        this.options = customDeepmerge(HERMES_OPTIONS, options);
        // Add resize observer to detect target element resizing.
        this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
        this.resizeObserver.observe(this.element);
        // Add mouse event handlers.
        this.element.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.calculate();
        this.draw();
    }
    static getTester() {
        return tester;
    }
    destroy() {
        this.resizeObserver.unobserve(this.element);
    }
    setSize(w, h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.size = { h, w };
    }
    calculate() {
        this.calculateScales();
        this.calculateLayout();
        this.calculateStyles();
    }
    calculateScales() {
        this.dimensions.forEach(dimension => {
            const _da = dimension.axis;
            const key = dimension.key;
            const data = this.data[key] || [];
            if ([AxisType.Linear, AxisType.Logarithmic].includes(_da.type)) {
                const range = getDataRange(data);
                if (_da.type === AxisType.Linear) {
                    _da.scale = new LinearScale(range[0], range[1], _da.dataOnEdge);
                }
                else if (_da.type === AxisType.Logarithmic) {
                    _da.scale = new LogScale(range[0], range[1], _da.logBase, _da.dataOnEdge);
                }
            }
            else if (_da.type === AxisType.Categorical) {
                _da.scale = new CategoricalScale(_da.categories, _da.dataOnEdge);
            }
        });
    }
    calculateLayout() {
        var _a, _b;
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const _ = {
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
        const { h, w } = this.size;
        const _l = _.layout;
        const _dsa = _.dims.shared.axes;
        const _dsl = _.dims.shared.label;
        const _dsly = _.dims.shared.layout;
        const dimCount = this.dimensions.length;
        const isHorizontal = this.options.direction === Direction.Horizontal;
        const dimLabelStyle = this.options.style.dimension.label;
        const dimLabelBoundaryPadding = this.options.style.dimension.label.boundaryPadding;
        const dimLayout = this.options.style.dimension.layout;
        const axesLabelStyle = this.options.style.axes.label;
        const axisBoundaryPadding = this.options.style.axes.axis.boundaryPadding;
        const isLabelBefore = dimLabelStyle.placement === LabelPlacement.Before;
        const isLabelAngled = dimLabelStyle.angle != null;
        const isAxesBefore = axesLabelStyle.placement === LabelPlacement.Before;
        /**
         * Calculate actual render area (canvas minus padding).
         */
        _l.drawRect = {
            h: h - _l.padding[0] - _l.padding[2],
            w: w - _l.padding[1] - _l.padding[3],
            x: _l.padding[3],
            y: _l.padding[0],
        };
        /**
         * Go through each of the dimension labels and calculate the size
         * of each one and figure out how much space is needed for them.
         */
        _dsl.cos = isLabelAngled ? Math.cos((_a = dimLabelStyle.angle) !== null && _a !== void 0 ? _a : 0) : undefined;
        _dsl.sin = isLabelAngled ? Math.sin((_b = dimLabelStyle.angle) !== null && _b !== void 0 ? _b : 0) : undefined;
        _dsl.rad = dimLabelStyle.angle || (isHorizontal ? undefined : (isLabelBefore ? -Math.PI : 0));
        _dsl.maxLengthCos = 0;
        _dsl.maxLengthSin = 0;
        this.dimensions.forEach((dimension, i) => {
            const textSize = getTextSize(this.ctx, dimension.label, dimLabelStyle.font);
            const _dlil = _.dims.list[i].label;
            _dlil.w = textSize.w;
            _dlil.h = textSize.h;
            _dlil.lengthCos = isLabelAngled ? textSize.w * _dsl.cos : textSize.w;
            _dlil.lengthSin = isLabelAngled ? textSize.w * _dsl.sin : textSize.h;
            if (Math.abs(_dlil.lengthCos) > Math.abs(_dsl.maxLengthCos)) {
                _dsl.maxLengthCos = _dlil.lengthCos;
            }
            if (Math.abs(_dlil.lengthSin) > Math.abs(_dsl.maxLengthSin)) {
                _dsl.maxLengthSin = _dlil.lengthSin;
            }
        });
        /**
         * Figure out the max axis pixel range after dimension labels are calculated.
         */
        _dsa.start = 0;
        _dsa.stop = 0;
        if (isHorizontal) {
            if (isLabelBefore) {
                const labelOffset = Math.max(0, _dsl.maxLengthSin);
                _dsa.start = _l.padding[0] + labelOffset + dimLabelStyle.offset;
                _dsa.stop = h - _l.padding[2];
            }
            else {
                const labelOffset = isLabelAngled ? Math.max(0, -_dsl.maxLengthSin) : _dsl.maxLengthSin;
                _dsa.start = _l.padding[0];
                _dsa.stop = h - _l.padding[2] - labelOffset - dimLabelStyle.offset;
            }
        }
        else {
            if (isLabelBefore) {
                const labelOffset = isLabelAngled ? Math.max(0, -_dsl.maxLengthCos) : _dsl.maxLengthCos;
                _dsa.start = _l.padding[3] + labelOffset + dimLabelStyle.offset;
                _dsa.stop = w - _l.padding[1];
            }
            else {
                const labelOffset = Math.max(0, _dsl.maxLengthCos);
                _dsa.start = _l.padding[3];
                _dsa.stop = w - _l.padding[1] - labelOffset - dimLabelStyle.offset;
            }
        }
        /**
         * Go through each axis and figure out the sizes of each axis labels.
         */
        _dsa.length = _dsa.stop - _dsa.start;
        _dsa.labelFactor = isAxesBefore ? -1 : 1;
        _dsly.totalBoundSpace = 0;
        this.dimensions.forEach((dimension, i) => {
            const _dlia = _.dims.list[i].axes;
            const _dlil = _.dims.list[i].label;
            const _dlily = _.dims.list[i].layout;
            const scale = dimension.axis.scale;
            /**
             * Update the scale info based on ticks and find the longest tick label.
             */
            _dlia.tickLabels = [];
            _dlia.tickPos = [];
            _dlia.maxLength = 0;
            if (scale) {
                scale.setAxisLength(_dsa.length);
                _dlia.tickLabels = scale.tickLabels.slice();
                _dlia.tickPos = scale.tickPos.slice();
                scale.tickLabels.forEach(tickLabel => {
                    const size = getTextSize(this.ctx, tickLabel, axesLabelStyle.font);
                    _dlia.maxLength = Math.max(size.w, _dlia.maxLength);
                });
            }
            /**
             * Figure out where the axis alignment center should be.
             * First, base it on the direction and dimension label placement.
             */
            if (_dlil.lengthCos == null) {
                _dlily.spaceBefore = (isHorizontal ? _dlil.w : _dlil.h) / 2;
                _dlily.spaceAfter = _dlily.spaceBefore;
            }
            else if (isHorizontal) {
                _dlily.spaceBefore = _dlil.lengthCos < 0 ? -_dlil.lengthCos : 0;
                _dlily.spaceAfter = _dlil.lengthCos > 0 ? _dlil.lengthCos : 0;
            }
            else {
                _dlily.spaceBefore = _dlil.lengthSin > 0 ? _dlil.lengthSin : 0;
                _dlily.spaceAfter = _dlil.lengthSin < 0 ? -_dlil.lengthSin : 0;
            }
            /**
             * See if axes labels are long enough to shift the axis center.
             */
            if (isAxesBefore) {
                _dlily.spaceBefore = Math.max(_dlily.spaceBefore, _dlia.maxLength);
            }
            else {
                _dlily.spaceAfter = Math.max(_dlily.spaceAfter, _dlia.maxLength);
            }
            /**
             * Caclulate the layout positions.
             */
            if (isHorizontal) {
                _dlily.bound = {
                    h: h - _l.padding[0] - _l.padding[2],
                    w: _dlily.spaceBefore + _dlily.spaceAfter,
                    x: 0,
                    y: _l.padding[0],
                };
                _dsly.totalBoundSpace += _dlily.bound.w;
            }
            else {
                _dlily.bound = {
                    h: _dlily.spaceBefore + _dlily.spaceAfter,
                    w: w - _l.padding[1] - _l.padding[3],
                    x: _l.padding[3],
                    y: 0,
                };
                _dsly.totalBoundSpace += _dlily.bound.h;
            }
        });
        /**
         * Calculate the gap spacing between the dimensions.
         */
        if (isHorizontal) {
            _dsly.gap = dimCount > 1 ? (_l.drawRect.w - _dsly.totalBoundSpace) / (dimCount - 1) : 0;
            _dsly.offset = _l.padding[3];
            _dsly.space = _l.drawRect.w / dimCount;
        }
        else {
            _dsly.gap = dimCount > 1 ? (_l.drawRect.h - _dsly.totalBoundSpace) / (dimCount - 1) : 0;
            _dsly.offset = _l.padding[0];
            _dsly.space = _l.drawRect.h / dimCount;
        }
        /**
         * Update the dimension bounding position.
         */
        let traversed = _dsly.offset;
        for (let i = 0; i < _.dims.list.length; i++) {
            const _dlil = _.dims.list[i].label;
            const _dlily = _.dims.list[i].layout;
            if (isHorizontal) {
                if (dimLayout === DimensionLayout.AxisEvenlySpaced) {
                    _dlily.bound.x = _dsly.offset + i * _dsly.space + _dsly.space / 2 - _dlily.spaceBefore;
                }
                else if (dimLayout === DimensionLayout.Equidistant) {
                    _dlily.bound.x = _dsly.offset + i * _dsly.space + (_dsly.space - _dlily.bound.w) / 2;
                }
                else if (dimLayout === DimensionLayout.EvenlySpaced) {
                    _dlily.bound.x = traversed;
                    traversed += _dsly.gap + _dlily.bound.w;
                }
                _dlily.axisStart = { x: _dlily.spaceBefore, y: _dsa.start - _l.padding[0] };
                _dlily.axisStop = { x: _dlily.spaceBefore, y: _dsa.stop - _l.padding[0] };
                _dlily.labelPoint = {
                    x: _dlily.spaceBefore,
                    y: isLabelBefore
                        ? _dsa.start - dimLabelStyle.offset - _l.padding[0]
                        : _dsa.stop + dimLabelStyle.offset - _l.padding[0],
                };
            }
            else {
                if (dimLayout === DimensionLayout.AxisEvenlySpaced) {
                    _dlily.bound.y = _dsly.offset + i * _dsly.space + _dsly.space / 2 - _dlily.spaceBefore;
                }
                else if (dimLayout === DimensionLayout.Equidistant) {
                    _dlily.bound.y = _dsly.offset + i * _dsly.space + (_dsly.space - _dlily.bound.h) / 2;
                }
                else if (dimLayout === DimensionLayout.EvenlySpaced) {
                    _dlily.bound.y = traversed;
                    traversed += _dsly.gap + _dlily.bound.h;
                }
                _dlily.axisStart = { x: _dsa.start - _l.padding[3], y: _dlily.spaceBefore };
                _dlily.axisStop = { x: _dsa.stop - _l.padding[3], y: _dlily.spaceBefore };
                _dlily.labelPoint = {
                    x: isLabelBefore
                        ? _dsa.start - dimLabelStyle.offset - _l.padding[1]
                        : _dsa.stop + dimLabelStyle.offset - _l.padding[1],
                    y: _dlily.spaceBefore,
                };
            }
            /**
             * Calculate the dimension label text boundary.
             */
            const offsetX = isHorizontal ? -_dlil.w / 2 : 0;
            const offsetY = isHorizontal ? (isLabelBefore ? -_dlil.h : 0) : -_dlil.h / 2;
            _dlily.labelBoundary = getTextBoundary(_dlily.bound.x + _dlily.labelPoint.x, _dlily.bound.y + _dlily.labelPoint.y, _dlil.w, _dlil.h, _dsl.rad, isLabelAngled ? 0 : offsetX, isLabelAngled ? -_dlil.h / 2 : offsetY, dimLabelBoundaryPadding);
            /**
             * Calculate the dimension axis boundary.
             */
            _dlily.axisBoundary = [
                {
                    x: _dlily.bound.x + _dlily.axisStart.x - (isHorizontal ? axisBoundaryPadding : 0),
                    y: _dlily.bound.y + _dlily.axisStart.y - (isHorizontal ? 0 : axisBoundaryPadding),
                },
                {
                    x: _dlily.bound.x + _dlily.axisStart.x + (isHorizontal ? axisBoundaryPadding : 0),
                    y: _dlily.bound.y + _dlily.axisStart.y + (isHorizontal ? 0 : axisBoundaryPadding),
                },
                {
                    x: _dlily.bound.x + _dlily.axisStop.x + (isHorizontal ? axisBoundaryPadding : 0),
                    y: _dlily.bound.y + _dlily.axisStop.y + (isHorizontal ? 0 : axisBoundaryPadding),
                },
                {
                    x: _dlily.bound.x + _dlily.axisStop.x - (isHorizontal ? axisBoundaryPadding : 0),
                    y: _dlily.bound.y + _dlily.axisStop.y - (isHorizontal ? 0 : axisBoundaryPadding),
                },
            ];
        }
        this._ = _;
    }
    calculateStyles() {
        if (!this._)
            return;
        this._.styles = this._.styles || [];
        const _os = this.options.style;
        const _osa = _os.axes;
        const _osd = _os.dimension;
        const _dl = this._.dims.list;
        const _s = this._.styles;
        const _ixsa = this.ix.shared.action;
        const _ixsf = this.ix.shared.focus;
        const isActive = _ixsa.type !== ActionType.None;
        for (let i = 0; i < _dl.length; i++) {
            const key = this.dimensions[i].key;
            const filters = this.filters[key] || [];
            const isDimActive = _ixsa.type === ActionType.LabelMove && _ixsa.dimIndex === i;
            const isDimFocused = (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.DimensionLabel && (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.dimIndex) === i;
            const isAxisActive = [
                ActionType.FilterCreate,
                ActionType.FilterMove,
                ActionType.FilterResizeAfter,
                ActionType.FilterResizeBefore,
            ].includes(_ixsa.type) && _ixsa.dimIndex === i;
            const isAxisFocused = (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.DimensionAxis && (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.dimIndex) === i;
            _s[i] = _s[i] || {};
            _s[i].label = {
                ..._osd.label,
                ...(!isDimActive && isDimFocused && !isActive ? _osd.labelHover : {}),
                ...(isDimActive ? _osd.labelActive : {}),
            };
            _s[i].axis = {
                ..._osa.axis,
                ...(!isAxisActive && isAxisFocused && !isActive ? _osa.axisHover : {}),
                ...(isAxisActive ? _osa.axisActve : {}),
            };
            _s[i].tick = {
                ..._osa.tick,
                ...(!isAxisActive && isAxisFocused && !isActive ? _osa.tickHover : {}),
                ...(isAxisActive ? _osa.tickActive : {}),
            };
            _s[i].tickLabel = {
                ..._osa.label,
                ...(!isAxisActive && isAxisFocused && !isActive ? _osa.labelHover : {}),
                ...(isAxisActive ? _osa.labelActive : {}),
            };
            _s[i].filters = filters.map((filter, j) => {
                const isFilterFocused = (((_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.Filter || (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.FilterResize) &&
                    (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.dimIndex) === i &&
                    (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.filterIndex) === j);
                const isFilterActive = _ixsa.dimIndex === i && _ixsa.filterIndex === j;
                return {
                    ..._osa.filter,
                    ...(!isFilterActive && isFilterFocused && !isActive ? _osa.filterHover : {}),
                    ...(isFilterActive ? _osa.filterActive : {}),
                };
            });
        }
    }
    getFocusByPoint(point) {
        if (!this._)
            return;
        const _dsa = this._.dims.shared.axes;
        const isHorizontal = this.options.direction === Direction.Horizontal;
        const vKey = isHorizontal ? 'y' : 'x';
        const axisLength = this._.dims.shared.axes.length;
        for (let i = 0; i < this._.dims.list.length; i++) {
            const key = this.dimensions[i].key;
            const layout = this._.dims.list[i].layout;
            // Check to see if a dimension label was targeted.
            const labelBoundary = layout.labelBoundary;
            if (isPointInTriangle(point, labelBoundary[0], labelBoundary[1], labelBoundary[2]) ||
                isPointInTriangle(point, labelBoundary[2], labelBoundary[3], labelBoundary[0])) {
                return { dimIndex: i, type: FocusType.DimensionLabel };
            }
            // Check to see if a dimension axis was targeted.
            const axisBoundary = layout.axisBoundary;
            if (isPointInTriangle(point, axisBoundary[0], axisBoundary[1], axisBoundary[2]) ||
                isPointInTriangle(point, axisBoundary[2], axisBoundary[3], axisBoundary[0])) {
                const filters = this.filters[key] || [];
                const axisOffset = layout.bound[vKey] + layout.axisStart[vKey];
                const p = (point[vKey] - axisOffset) / axisLength;
                const filterIndex = filters.findIndex(filter => p >= filter.p0 && p <= filter.p1);
                let type = FocusType.DimensionAxis;
                if (filterIndex !== -1) {
                    const threshold = FILTER_RESIZE_THRESHOLD / _dsa.length;
                    const filter = filters[filterIndex];
                    const isResize = p <= filter.p0 + threshold || p >= filter.p1 - threshold;
                    type = isResize ? FocusType.FilterResize : FocusType.Filter;
                }
                return { dimIndex: i, filterIndex, type };
            }
        }
    }
    updateActiveLabel() {
        if (!this._ || this.ix.shared.action.type !== ActionType.LabelMove)
            return;
        const _dl = this._.dims.list;
        const _ix = this.ix;
        const _ixd = _ix.dimension;
        const _ixsa = _ix.shared.action;
        const isHorizontal = this.options.direction === Direction.Horizontal;
        const hKey = isHorizontal ? 'x' : 'y';
        _ixd.boundOffset = {
            x: isHorizontal ? _ixsa.p1.x - _ixsa.p0.x : 0,
            y: isHorizontal ? 0 : _ixsa.p1.y - _ixsa.p0.y,
        };
        for (let i = 0; i < _dl.length; i++) {
            const layout = _dl[i].layout;
            const bound = layout.bound;
            const axisStart = layout.axisStart;
            const axisDistance = (_ixd.axis + _ixd.boundOffset[hKey]) - (bound[hKey] + axisStart[hKey]);
            /**
             * Check that...
             * 1. dimension drag type is triggered by the label
             * 2. dimension being dragged isn't being the dimension getting compared to (i)
             * 3. dimension is within a distance threshold
             */
            if (_ixsa.dimIndex !== i && Math.abs(axisDistance) < DIMENSION_SWAP_THRESHOLD) {
                // Swap dragging dimension with the dimension it intersects with.
                const tempDim = this.dimensions[_ixsa.dimIndex];
                this.dimensions[_ixsa.dimIndex] = this.dimensions[i];
                this.dimensions[i] = tempDim;
                // Update the drag dimension's index
                _ixsa.dimIndex = i;
            }
        }
    }
    setActiveFilter(key, pos, value) {
        if (!this._)
            return;
        const _filters = this.filters;
        const _ix = this.ix;
        const _ixsa = _ix.shared.action;
        const _ixf = _ix.filters;
        const _dsa = this._.dims.shared.axes;
        // See if there is an existing matching filter based on % position.
        const index = (_filters[key] || []).findIndex(filter => pos >= filter.p0 && pos <= filter.p1);
        if (index !== -1) {
            _ixf.active = _filters[key][index];
            _ixf.active.startP0 = _ixf.active.p0;
            _ixf.active.startP1 = _ixf.active.p1;
            _ixsa.filterIndex = index;
            if (pos >= _ixf.active.p0 &&
                pos <= _ixf.active.p0 + (FILTER_RESIZE_THRESHOLD / _dsa.length)) {
                _ixsa.type = ActionType.FilterResizeBefore;
            }
            else if (pos >= _ixf.active.p1 - (FILTER_RESIZE_THRESHOLD / _dsa.length) &&
                pos <= _ixf.active.p1) {
                _ixsa.type = ActionType.FilterResizeAfter;
            }
            else {
                _ixsa.type = ActionType.FilterMove;
            }
        }
        else {
            _ixsa.type = ActionType.FilterCreate;
            _ixf.active = { p0: pos, p1: pos, value0: value, value1: value };
            // Store active filter into filter list.
            _filters[key] = _filters[key] || [];
            _filters[key].push(_ixf.active);
            _ixsa.filterIndex = _filters[key].length - 1;
        }
    }
    updateActiveFilter(e) {
        var _a, _b;
        if (!this._)
            return;
        const _dl = this._.dims.list;
        const _dsa = this._.dims.shared.axes;
        const _ix = this.ix;
        const _ixf = _ix.filters;
        const _ixs = _ix.shared;
        const _ixsa = _ixs.action;
        const _filters = this.filters;
        const index = _ixsa.dimIndex;
        const isHorizontal = this.options.direction === Direction.Horizontal;
        const filterKey = isHorizontal ? 'y' : 'x';
        const isFilterAction = [
            ActionType.FilterCreate,
            ActionType.FilterMove,
            ActionType.FilterResizeAfter,
            ActionType.FilterResizeBefore,
        ].includes(_ixsa.type);
        if (!isFilterAction || !_ixf.key)
            return;
        const bound = _dl[_ixsa.dimIndex].layout.bound;
        const axisStart = _dl[_ixsa.dimIndex].layout.axisStart[filterKey];
        /**
         * If the active filter previously exists, we want to drag it,
         * otherwise we want to change the size of the new one based on event position.
         */
        if (_ixsa.type === ActionType.FilterMove) {
            const startP0 = (_a = _ixf.active.startP0) !== null && _a !== void 0 ? _a : 0;
            const startP1 = (_b = _ixf.active.startP1) !== null && _b !== void 0 ? _b : 0;
            const startLength = startP1 - startP0;
            const shift = (_ixsa.p1[filterKey] - _ixsa.p0[filterKey]) / _dsa.length;
            _ixf.active.p0 = startP0 + shift;
            _ixf.active.p1 = startP1 + shift;
            // Cap the drag to the axis edges.
            if (_ixf.active.p0 < 0.0) {
                _ixf.active.p0 = 0;
                _ixf.active.p1 = startLength;
            }
            else if (_ixf.active.p1 > 1.0) {
                _ixf.active.p0 = 1.0 - startLength;
                _ixf.active.p1 = 1.0;
            }
            _ixf.active.value0 = this.dimensions[index].axis.scale.percentToValue(_ixf.active.p0);
            _ixf.active.value1 = this.dimensions[index].axis.scale.percentToValue(_ixf.active.p1);
        }
        else if (_ixsa.type === ActionType.FilterResizeBefore) {
            _ixf.active.p0 = (_ixsa.p1[filterKey] - bound[filterKey] - axisStart) / _dsa.length;
            _ixf.active.p0 = capDataRange(_ixf.active.p0, [0.0, 1.0]);
            _ixf.active.value0 = this.dimensions[index].axis.scale.percentToValue(_ixf.active.p0);
        }
        else {
            _ixf.active.p1 = (_ixsa.p1[filterKey] - bound[filterKey] - axisStart) / _dsa.length;
            _ixf.active.p1 = capDataRange(_ixf.active.p1, [0.0, 1.0]);
            _ixf.active.value1 = this.dimensions[index].axis.scale.percentToValue(_ixf.active.p1);
        }
        // Whether or not to finalize active filter and removing reference to it.
        if (e.type !== 'mouseup')
            return;
        /**
         * Check to see if the release event is near the starting event.
         * If so, remove the previously added filter and clear out the active filter.
         */
        if (distance(_ixsa.p0, _ixsa.p1) < FILTER_REMOVE_THRESHOLD) {
            // Remove matching filter based on event position value.
            const filters = _filters[_ixf.key] || [];
            const pos = (_ixf.active.p1 - _ixf.active.p0) / 2 + _ixf.active.p0;
            const removeIndex = filters.findIndex(filter => pos >= filter.p0 && pos <= filter.p1);
            if (removeIndex !== -1)
                filters.splice(removeIndex, 1);
        }
        // Swap p0 and p1 if p1 is less than p0.
        if (_ixf.active.p1 < _ixf.active.p0) {
            const [tempP, tempValue] = [_ixf.active.p1, _ixf.active.value1];
            [_ixf.active.p1, _ixf.active.value1] = [_ixf.active.p0, _ixf.active.value0];
            [_ixf.active.p0, _ixf.active.value0] = [tempP, tempValue];
        }
        // Overwrite active filter to remove reference to filter in filters list.
        _ixf.active = { ...FILTER };
        _ixf.key = undefined;
        this.cleanUpFilters();
    }
    cleanUpFilters() {
        Object.keys(this.filters).forEach(key => {
            const filters = this.filters[key] || [];
            for (let i = 0; i < filters.length; i++) {
                // Remove invalid filters or filters that are sized 0.
                if (isFilterInvalid(filters[i])) {
                    filters[i] = { ...FILTER };
                    continue;
                }
                for (let j = i + 1; j < filters.length; j++) {
                    if (isFilterEmpty(filters[i]) || isFilterEmpty(filters[j]))
                        continue;
                    /**
                     * If overlap, merge into higher indexed filter and remove lower indexed
                     * filter to avoid checking the removed filter during the loop.
                     */
                    if (isIntersectingFilters(filters[i], filters[j])) {
                        filters[j] = mergeFilters(filters[i], filters[j]);
                        filters[i] = { ...FILTER };
                    }
                }
            }
            this.filters[key] = filters.filter(filter => !isFilterEmpty(filter));
        });
    }
    updateCursor() {
        const _ix = this.ix;
        const _ixsa = _ix.shared.action;
        const _ixsf = _ix.shared.focus;
        const isHorizontal = this.options.direction === Direction.Horizontal;
        let cursor = 'default';
        if (_ixsa.type !== ActionType.None) {
            if ([ActionType.FilterMove, ActionType.LabelMove].includes(_ixsa.type)) {
                cursor = 'grabbing';
            }
            else if ([
                ActionType.FilterResizeAfter,
                ActionType.FilterResizeBefore,
            ].includes(_ixsa.type)) {
                cursor = isHorizontal ? 'ns-resize' : 'ew-resize';
            }
            else if (_ixsa.type === ActionType.FilterCreate) {
                cursor = 'crosshair';
            }
        }
        else if (_ixsf !== undefined) {
            if (_ixsf.type === FocusType.DimensionLabel) {
                cursor = 'grab';
            }
            else if (_ixsf.type === FocusType.DimensionAxis) {
                cursor = 'crosshair';
            }
            else if (_ixsf.type === FocusType.Filter) {
                cursor = 'grab';
            }
            else if (_ixsf.type === FocusType.FilterResize) {
                cursor = isHorizontal ? 'ns-resize' : 'ew-resize';
            }
        }
        this.canvas.style.cursor = cursor;
    }
    draw() {
        var _a;
        if (!this._)
            return;
        const { h, w } = this.size;
        const _dl = this._.dims.list;
        const _dsa = this._.dims.shared.axes;
        const _dsl = this._.dims.shared.label;
        const _s = this._.styles;
        const _ix = this.ix;
        const _ixsf = this.ix.shared.focus;
        const _filters = this.filters;
        const isHorizontal = this.options.direction === Direction.Horizontal;
        const axesStyle = this.options.style.axes;
        const dataStyle = this.options.style.data;
        const dimStyle = this.options.style.dimension;
        const isLabelBefore = dimStyle.label.placement === LabelPlacement.Before;
        const isAxesBefore = axesStyle.label.placement === LabelPlacement.Before;
        // Clear previous canvas drawings.
        this.ctx.clearRect(0, 0, w, h);
        // Draw data lines.
        const dimColorKey = (_a = dataStyle.colorScale) === null || _a === void 0 ? void 0 : _a.dimensionKey;
        for (let k = 0; k < this.dataCount; k++) {
            let dataDefaultStyle = dataStyle.default;
            let hasFilters = false;
            let isFilteredOut = false;
            const series = this.dimensions.map((dimension, i) => {
                var _a, _b, _c, _d, _e, _f, _g;
                const key = dimension.key;
                const layout = _dl[i].layout;
                const bound = getDragBound(i, _ix, layout.bound);
                const value = this.data[key][k];
                const pos = (_b = (_a = dimension.axis.scale) === null || _a === void 0 ? void 0 : _a.valueToPos(value)) !== null && _b !== void 0 ? _b : 0;
                const percent = (_d = (_c = dimension.axis.scale) === null || _c === void 0 ? void 0 : _c.valueToPercent(value)) !== null && _d !== void 0 ? _d : 0;
                const x = bound.x + layout.axisStart.x + (isHorizontal ? 0 : pos);
                const y = bound.y + layout.axisStart.y + (isHorizontal ? pos : 0);
                if (dimColorKey === key) {
                    const percent = (_f = (_e = dimension.axis.scale) === null || _e === void 0 ? void 0 : _e.valueToPercent(value)) !== null && _f !== void 0 ? _f : 0;
                    const scaleColor = scale2rgba(((_g = dataStyle.colorScale) === null || _g === void 0 ? void 0 : _g.colors) || [], percent);
                    dataDefaultStyle.strokeStyle = scaleColor;
                }
                /**
                 * Check for filters on this dimension and make the filtering
                 * use AND behavior instead of OR between all the dimensions.
                 */
                if (_filters[key] && _filters[key].length !== 0) {
                    hasFilters = true;
                    let hasMatchedFilter = false;
                    for (let f = 0; f < _filters[key].length; f++) {
                        const filter = _filters[key][f];
                        const filterMin = Math.min(filter.p0, filter.p1);
                        const filterMax = Math.max(filter.p0, filter.p1);
                        if (percent >= filterMin && percent <= filterMax) {
                            hasMatchedFilter = true;
                            break;
                        }
                    }
                    if (!hasMatchedFilter)
                        isFilteredOut = true;
                }
                return { x, y };
            });
            if (hasFilters && isFilteredOut)
                dataDefaultStyle = dataStyle.filtered;
            drawData(this.ctx, series, isHorizontal, dataStyle.path, dataDefaultStyle);
        }
        // Draw dimension labels.
        const labelAdjust = dimStyle.label.angle == null && isHorizontal;
        const dimTextStyle = {
            textAlign: labelAdjust ? 'center' : undefined,
            textBaseline: labelAdjust ? (isLabelBefore ? 'bottom' : 'top') : undefined,
        };
        this.dimensions.forEach((dimension, i) => {
            var _a;
            const bound = getDragBound(i, _ix, _dl[i].layout.bound);
            const labelPoint = _dl[i].layout.labelPoint;
            const x = bound.x + labelPoint.x;
            const y = bound.y + labelPoint.y;
            const style = { ..._s[i].label, ...dimTextStyle };
            drawText(this.ctx, dimension.label, x, y, (_a = _dsl.rad) !== null && _a !== void 0 ? _a : 0, style);
        });
        // Draw dimension axes.
        const tickAdjust = axesStyle.label.angle == null && isHorizontal;
        const tickTextStyle = {
            textAlign: tickAdjust ? undefined : 'center',
            textBaseline: tickAdjust ? undefined : (isAxesBefore ? 'bottom' : 'top'),
        };
        _dl.forEach((dim, i) => {
            const key = this.dimensions[i].key;
            const bound = getDragBound(i, _ix, dim.layout.bound);
            const axisStart = dim.layout.axisStart;
            const axisStop = dim.layout.axisStop;
            const tickLabels = dim.axes.tickLabels;
            const tickPos = dim.axes.tickPos;
            const tickLengthFactor = isAxesBefore ? -1 : 1;
            const filters = _filters[key] || [];
            drawLine(this.ctx, bound.x + axisStart.x, bound.y + axisStart.y, bound.x + axisStop.x, bound.y + axisStop.y, _s[i].axis);
            for (let j = 0; j < tickLabels.length; j++) {
                let tickLabel = tickLabels[j];
                if (tickLabel[0] === '*') {
                    if ((_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.dimIndex) === i && ((_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.DimensionAxis ||
                        (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.Filter ||
                        (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.FilterResize)) {
                        tickLabel = tickLabel.substring(1);
                    }
                    else {
                        continue;
                    }
                }
                const xOffset = isHorizontal ? 0 : tickPos[j];
                const yOffset = isHorizontal ? tickPos[j] : 0;
                const xTickLength = isHorizontal ? tickLengthFactor * axesStyle.tick.length : 0;
                const yTickLength = isHorizontal ? 0 : tickLengthFactor * axesStyle.tick.length;
                const x0 = bound.x + axisStart.x + xOffset;
                const y0 = bound.y + axisStart.y + yOffset;
                const x1 = bound.x + axisStart.x + xOffset + xTickLength;
                const y1 = bound.y + axisStart.y + yOffset + yTickLength;
                drawLine(this.ctx, x0, y0, x1, y1, _s[i].tick);
                const cx = isHorizontal ? x1 + tickLengthFactor * axesStyle.label.offset : x0;
                const cy = isHorizontal ? y0 : y1 + tickLengthFactor * axesStyle.label.offset;
                const rad = axesStyle.label.angle != null
                    ? axesStyle.label.angle
                    : (isHorizontal && isAxesBefore ? Math.PI : 0);
                const style = { ..._s[i].tickLabel, ...tickTextStyle };
                drawText(this.ctx, tickLabel, cx, cy, rad, style);
            }
            filters.forEach((filter, j) => {
                const p0 = filter.p0 * _dsa.length;
                const p1 = filter.p1 * _dsa.length;
                const width = _s[i].filters[j].width;
                const halfWidth = width / 2;
                const x = bound.x + axisStart.x + (isHorizontal ? -halfWidth : p0);
                const y = bound.y + axisStart.y + (isHorizontal ? p0 : -halfWidth);
                const w = isHorizontal ? width : p1 - p0;
                const h = isHorizontal ? p1 - p0 : width;
                drawRect(this.ctx, x, y, w, h, _s[i].filters[j]);
            });
        });
    }
    drawDebugOutline() {
        if (!this._)
            return;
        const { h, w } = this.size;
        const _l = this._.layout;
        const _dl = this._.dims.list;
        const _dsly = this._.dims.shared.layout;
        const isHorizontal = this.options.direction === Direction.Horizontal;
        // Draw the drawing area by outlining paddings.
        const paddingStyle = { strokeStyle: '#dddddd' };
        drawLine(this.ctx, 0, _l.padding[0], w, _l.padding[0], paddingStyle);
        drawLine(this.ctx, 0, h - _l.padding[2], w, h - _l.padding[2], paddingStyle);
        drawLine(this.ctx, _l.padding[3], 0, _l.padding[3], h, paddingStyle);
        drawLine(this.ctx, w - _l.padding[1], 0, w - _l.padding[1], h, paddingStyle);
        // Draw each dimension rough outline with bounding box.
        const dimStyle = { strokeStyle: '#999999' };
        const boundStyle = { strokeStyle: '#dddddd' };
        const axisBoundaryStyle = { fillStyle: '#eeeeee' };
        const labelPointStyle = { fillStyle: '#00ccff', strokeStyle: '#0099cc' };
        const labelBoundaryStyle = { fillStyle: '#ffcc00' };
        _dl.forEach((dim, i) => {
            const bound = dim.layout.bound;
            const axisBoundary = dim.layout.axisBoundary;
            const labelPoint = dim.layout.labelPoint;
            const labelBoundary = dim.layout.labelBoundary;
            drawRect(this.ctx, isHorizontal ? _l.padding[3] + i * _dsly.space : bound.x, isHorizontal ? bound.y : _l.padding[0] + i * _dsly.space, isHorizontal ? _dsly.space : bound.w, isHorizontal ? bound.h : _dsly.space, dimStyle);
            drawRect(this.ctx, bound.x, bound.y, bound.w, bound.h, boundStyle);
            drawCircle(this.ctx, bound.x + labelPoint.x, bound.y + labelPoint.y, 3, labelPointStyle);
            drawBoundary(this.ctx, labelBoundary, labelBoundaryStyle);
            drawBoundary(this.ctx, axisBoundary, axisBoundaryStyle);
        });
    }
    handleResize(entries) {
        const { width: w1, height: h1 } = entries[0].contentRect;
        const { w: w0, h: h0 } = this.size;
        if (w0 === w1 && h0 === h1)
            return;
        this.setSize(w1, h1);
        this.calculate();
        this.draw();
    }
    handleDoubleClick() {
        // Reset chart settings.
        this.dimensions = clone(this.dimensionsOriginal);
        this.filters = {};
        this.ix = clone(IX);
        this.calculate();
        this.draw();
    }
    handleMouseDown(e) {
        var _a, _b;
        if (!this._)
            return;
        const _ixs = this.ix.shared;
        const _ixsa = this.ix.shared.action;
        const _ixd = this.ix.dimension;
        const _ixf = this.ix.filters;
        const _dsa = this._.dims.shared.axes;
        const isHorizontal = this.options.direction === Direction.Horizontal;
        const hKey = isHorizontal ? 'x' : 'y';
        const vKey = isHorizontal ? 'y' : 'x';
        const point = { x: e.clientX, y: e.clientY };
        _ixsa.p0 = point;
        _ixsa.p1 = point;
        _ixsa.filterIndex = -1;
        _ixs.focus = this.getFocusByPoint(point);
        if (_ixs.focus) {
            const i = _ixs.focus.dimIndex;
            const layout = this._.dims.list[i].layout;
            const bound = layout.bound;
            const axisStart = layout.axisStart;
            if (((_a = _ixs.focus) === null || _a === void 0 ? void 0 : _a.type) === FocusType.DimensionLabel) {
                _ixsa.type = ActionType.LabelMove;
                _ixsa.dimIndex = i;
                _ixd.axis = bound[hKey] + axisStart[hKey];
                _ixd.bound = bound;
            }
            else if ([
                FocusType.DimensionAxis,
                FocusType.Filter,
                FocusType.FilterResize,
            ].includes((_b = _ixs.focus) === null || _b === void 0 ? void 0 : _b.type)) {
                _ixsa.type = ActionType.FilterCreate;
                _ixsa.dimIndex = i;
                _ixf.key = this.dimensions[i].key;
                const p0 = (_ixsa.p0[vKey] - bound[vKey] - axisStart[vKey]) / _dsa.length;
                const value0 = this.dimensions[i].axis.scale.percentToValue(p0);
                this.setActiveFilter(_ixf.key, p0, value0);
            }
        }
        // Update cursor pointer based on type and position.
        this.updateCursor();
        this.calculate();
        this.draw();
    }
    handleMouseMove(e) {
        if (!this._)
            return;
        const point = { x: e.clientX, y: e.clientY };
        const _ixs = this.ix.shared;
        _ixs.action.p1 = point;
        _ixs.focus = this.getFocusByPoint(point);
        // Update dimension dragging via label.
        this.updateActiveLabel();
        // Update dimension filter creating dragging data.
        this.updateActiveFilter(e);
        // Update cursor pointer based on type and position.
        this.updateCursor();
        this.calculate();
        this.draw();
    }
    handleMouseUp(e) {
        if (!this._ || this.ix.shared.action.type === ActionType.None)
            return;
        const point = { x: e.clientX, y: e.clientY };
        this.ix.shared.action.p1 = point;
        // Update active filter upon release event.
        this.updateActiveFilter(e);
        // Reset drag info but preserve focus.
        this.ix = clone(IX);
        this.ix.shared.focus = this.getFocusByPoint(point);
        // Update cursor pointer based on type and position.
        this.updateCursor();
        this.calculate();
        this.draw();
    }
}

export { Hermes as default };
