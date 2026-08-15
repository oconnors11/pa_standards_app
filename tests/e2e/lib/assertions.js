/**
 * RBCS PA Standards E2E Test Suite - Assertions Library
 * Standalone, zero-dependency assertion module with rich error diffs and strict type checks.
 */

export class AssertionError extends Error {
  constructor(message, { actual, expected, operator } = {}) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
    this.operator = operator;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssertionError);
    }
  }
}

function formatValue(val) {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return JSON.stringify(val);
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
  if (val instanceof RegExp) return val.toString();
  if (val instanceof Date) return `Date(${val.toISOString()})`;
  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';
    if (val.length <= 5) return `[${val.map(formatValue).join(', ')}]`;
    return `[${val.slice(0, 5).map(formatValue).join(', ')}, ... +${val.length - 5} more]`;
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val);
    if (keys.length === 0) return '{}';
    if (keys.length <= 4) {
      return `{ ${keys.map(k => `${k}: ${formatValue(val[k])}`).join(', ')} }`;
    }
    return `{ ${keys.slice(0, 4).map(k => `${k}: ${formatValue(val[k])}`).join(', ')}, ... +${keys.length - 4} more }`;
  }
  return String(val);
}

function isDeepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (a === null || b === null || a === undefined || b === undefined) return a === b;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  if (a instanceof RegExp && b instanceof RegExp) return a.toString() === b.toString();
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (Array.isArray(b)) return false;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!isDeepEqual(a[key], b[key])) return false;
  }
  return true;
}

export const assert = {
  strictEqual(actual, expected, message) {
    if (!Object.is(actual, expected)) {
      const msg = message || `Expected values to be strictly equal (===):\n  Actual:   ${formatValue(actual)}\n  Expected: ${formatValue(expected)}`;
      throw new AssertionError(msg, { actual, expected, operator: 'strictEqual' });
    }
  },

  notStrictEqual(actual, expected, message) {
    if (Object.is(actual, expected)) {
      const msg = message || `Expected values not to be strictly equal (!==):\n  Actual:   ${formatValue(actual)}\n  Expected: ${formatValue(expected)}`;
      throw new AssertionError(msg, { actual, expected, operator: 'notStrictEqual' });
    }
  },

  deepStrictEqual(actual, expected, message) {
    if (!isDeepEqual(actual, expected)) {
      const msg = message || `Expected values to be deeply equal:\n  Actual:   ${formatValue(actual)}\n  Expected: ${formatValue(expected)}`;
      throw new AssertionError(msg, { actual, expected, operator: 'deepStrictEqual' });
    }
  },

  notDeepStrictEqual(actual, expected, message) {
    if (isDeepEqual(actual, expected)) {
      const msg = message || `Expected values not to be deeply equal:\n  Actual:   ${formatValue(actual)}\n  Expected: ${formatValue(expected)}`;
      throw new AssertionError(msg, { actual, expected, operator: 'notDeepStrictEqual' });
    }
  },

  ok(value, message) {
    if (!value) {
      const msg = message || `Expected truthy value, but received: ${formatValue(value)}`;
      throw new AssertionError(msg, { actual: value, expected: true, operator: 'ok' });
    }
  },

  match(string, regex, message) {
    if (typeof string !== 'string') {
      throw new AssertionError(`assert.match target must be a string, got ${typeof string}`, { actual: string, expected: 'string', operator: 'match' });
    }
    const re = regex instanceof RegExp ? regex : new RegExp(regex);
    if (!re.test(string)) {
      const msg = message || `Expected string to match ${re.toString()}:\n  String: ${formatValue(string)}`;
      throw new AssertionError(msg, { actual: string, expected: re.toString(), operator: 'match' });
    }
  },

  notMatch(string, regex, message) {
    if (typeof string !== 'string') {
      throw new AssertionError(`assert.notMatch target must be a string, got ${typeof string}`, { actual: string, expected: 'string', operator: 'notMatch' });
    }
    const re = regex instanceof RegExp ? regex : new RegExp(regex);
    if (re.test(string)) {
      const msg = message || `Expected string NOT to match ${re.toString()}:\n  String: ${formatValue(string)}`;
      throw new AssertionError(msg, { actual: string, expected: `!${re.toString()}`, operator: 'notMatch' });
    }
  },

  includes(collection, item, message) {
    let found = false;
    if (typeof collection === 'string') {
      found = collection.includes(String(item));
    } else if (Array.isArray(collection)) {
      found = collection.some(el => isDeepEqual(el, item));
    } else if (collection instanceof Set || collection instanceof Map) {
      found = collection.has(item);
    } else if (typeof collection === 'object' && collection !== null) {
      found = Object.prototype.hasOwnProperty.call(collection, item);
    }

    if (!found) {
      const msg = message || `Expected collection to include item:\n  Collection: ${formatValue(collection)}\n  Item:       ${formatValue(item)}`;
      throw new AssertionError(msg, { actual: collection, expected: item, operator: 'includes' });
    }
  },

  inRange(value, min, max, message) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new AssertionError(`Expected a valid number, got ${formatValue(value)}`, { actual: value, operator: 'inRange' });
    }
    if (value < min || value > max) {
      const msg = message || `Expected ${value} to be within range [${min}, ${max}]`;
      throw new AssertionError(msg, { actual: value, expected: `[${min}, ${max}]`, operator: 'inRange' });
    }
  },

  hasKeys(obj, expectedKeys, message) {
    if (!obj || typeof obj !== 'object') {
      throw new AssertionError(`Expected an object, got ${formatValue(obj)}`, { actual: obj, operator: 'hasKeys' });
    }
    const missing = expectedKeys.filter(k => !(k in obj));
    if (missing.length > 0) {
      const msg = message || `Expected object to contain keys [${missing.join(', ')}]:\n  Object keys: [${Object.keys(obj).join(', ')}]`;
      throw new AssertionError(msg, { actual: Object.keys(obj), expected: expectedKeys, operator: 'hasKeys' });
    }
  },

  closeTo(actual, expected, delta = 0.001, message) {
    if (typeof actual !== 'number' || typeof expected !== 'number') {
      throw new AssertionError(`assert.closeTo requires numeric arguments`, { actual, expected, operator: 'closeTo' });
    }
    const diff = Math.abs(actual - expected);
    if (diff > delta) {
      const msg = message || `Expected ${actual} to be close to ${expected} within delta ${delta} (actual diff: ${diff})`;
      throw new AssertionError(msg, { actual, expected, operator: 'closeTo' });
    }
  },

  throws(fn, expectedError, message) {
    if (typeof fn !== 'function') {
      throw new AssertionError(`assert.throws requires a function, got ${typeof fn}`);
    }
    let threw = false;
    let caughtError = null;
    try {
      fn();
    } catch (err) {
      threw = true;
      caughtError = err;
    }

    if (!threw) {
      const msg = message || `Expected function to throw an error, but it executed without throwing.`;
      throw new AssertionError(msg, { actual: 'no error', expected: 'Error', operator: 'throws' });
    }

    if (expectedError) {
      if (typeof expectedError === 'function') {
        if (!(caughtError instanceof expectedError)) {
          const msg = message || `Expected thrown error to be instance of ${expectedError.name}, got ${caughtError?.name || typeof caughtError}`;
          throw new AssertionError(msg, { actual: caughtError, expected: expectedError.name, operator: 'throws' });
        }
      } else if (expectedError instanceof RegExp) {
        if (!expectedError.test(caughtError?.message || '')) {
          const msg = message || `Expected error message to match ${expectedError}, got "${caughtError?.message}"`;
          throw new AssertionError(msg, { actual: caughtError?.message, expected: expectedError.toString(), operator: 'throws' });
        }
      }
    }
  },

  async rejects(asyncFn, expectedError, message) {
    if (typeof asyncFn !== 'function' && !(asyncFn instanceof Promise)) {
      throw new AssertionError(`assert.rejects requires an async function or Promise`);
    }
    let threw = false;
    let caughtError = null;
    try {
      if (typeof asyncFn === 'function') {
        await asyncFn();
      } else {
        await asyncFn;
      }
    } catch (err) {
      threw = true;
      caughtError = err;
    }

    if (!threw) {
      const msg = message || `Expected Promise to reject, but it resolved successfully.`;
      throw new AssertionError(msg, { actual: 'resolved', expected: 'rejected', operator: 'rejects' });
    }

    if (expectedError) {
      if (typeof expectedError === 'function') {
        if (!(caughtError instanceof expectedError)) {
          const msg = message || `Expected rejection to be instance of ${expectedError.name}, got ${caughtError?.name}`;
          throw new AssertionError(msg, { actual: caughtError, expected: expectedError.name, operator: 'rejects' });
        }
      } else if (expectedError instanceof RegExp) {
        if (!expectedError.test(caughtError?.message || '')) {
          const msg = message || `Expected rejection message to match ${expectedError}, got "${caughtError?.message}"`;
          throw new AssertionError(msg, { actual: caughtError?.message, expected: expectedError.toString(), operator: 'rejects' });
        }
      }
    }
  }
};

export default assert;
