import bigInt from "big-integer";
import { z } from "zod";

const MAX_BIG_INT = 64;
const SMALL_INT = 16;
const PARTS = MAX_BIG_INT / SMALL_INT;

function checkBrowserSupportsBigInt() {
    try {
        BigInt;
        return true;
    } catch {
        return false;
    }
}

function fromHexReverseArray(hexValues: number[], start: number, size: number) {
    let value = 0;

    for (let i = 0; i < size; i++) {
        const byte = hexValues[start + i];
        if (byte === void 0) break;

        value += byte * Math.pow(16, i);
    }

    return value;
}

function toHexReverseArray(value: string) {
    const sum: number[] = [];

    for (let i = 0; i < value.length; i++) {
        let s = Number(value[i]);

        for (let j = 0; s || j < sum.length; j++) {
            s += (sum[j] || 0) * 10;
            sum[j] = s % 16;
            s = (s - sum[j]) / 16;
        }
    }

    return sum;
}

function splitBigInt(value: string) {
    const sum = toHexReverseArray(value);
    const parts: number[] = Array(PARTS);

    for (let i = 0; i < PARTS; i++) {
        parts[PARTS - 1 - i] = fromHexReverseArray(sum, i * PARTS, PARTS);
    }

    return parts;
}

class HighLow {
    parts: number[];
    str?: string;

    constructor(parts: number[], str?: string) {
        this.parts = parts;
        this.str = str;
    }

    static fromString(value: string) {
        return new HighLow(splitBigInt(value), value);
    }

    static fromBit(index: number) {
        const parts = Array(PARTS);
        const offset = Math.floor(index / SMALL_INT);

        for (let i = 0; i < PARTS; i++) {
            parts[PARTS - 1 - i] =
                i === offset ? 1 << (index - offset * SMALL_INT) : 0;
        }

        return new HighLow(parts);
    }

    and({ parts }: { parts: number[] }) {
        return new HighLow(this.parts.map((v, i) => v & parts[i]));
    }

    or({ parts }: { parts: number[] }) {
        return new HighLow(this.parts.map((v, i) => v | parts[i]));
    }

    xor({ parts }: { parts: number[] }) {
        return new HighLow(this.parts.map((v, i) => v ^ parts[i]));
    }

    not() {
        return new HighLow(this.parts.map(v => ~v));
    }

    equals({ parts }: { parts: number[] }) {
        return this.parts.every((v, i) => v === parts[i]);
    }

    toString() {
        if (this.str != null) return this.str;

        const array = new Array(MAX_BIG_INT / 4);

        this.parts.forEach((value, offset) => {
            const hex = toHexReverseArray(value.toString());

            for (let i = 0; i < 4; i++) {
                array[i + offset * 4] = hex[4 - 1 - i] || 0;
            }
        });

        return (this.str = bigInt.fromArray(array, 16).toString());
    }

    toJSON() {
        return this.toString();
    }
}

const SUPPORTS_BIGINT = checkBrowserSupportsBigInt();

if (SUPPORTS_BIGINT && (BigInt.prototype as any).toJSON == null) {
    (BigInt.prototype as any).toJSON = function () {
        return this.toString();
    };
}

const HIGH_LOW_CACHE: Record<string, HighLow> = {};

const convertToBigFlag = (
    SUPPORTS_BIGINT
        ? function convertToBigFlagBigInt(value: string | number | bigint) {
              return BigInt(value);
          }
        : function convertToBigFlagHighLow(value: HighLow | number | string) {
              return value instanceof HighLow
                  ? value
                  : (typeof value == "number" && (value = value.toString()),
                    HIGH_LOW_CACHE[value] != null ||
                        (HIGH_LOW_CACHE[value] = HighLow.fromString(value)),
                    HIGH_LOW_CACHE[value]);
          }
) as (value: string | number | bigint | HighLow) => bigint | HighLow;

const EMPTY_FLAG = convertToBigFlag(0);

function satisfyTypeScript(empty: bigint | HighLow): empty is bigint {
    return SUPPORTS_BIGINT;
}

const flagAnd = satisfyTypeScript(EMPTY_FLAG)
    ? function flagAndBigInt(first = EMPTY_FLAG, second = EMPTY_FLAG) {
          return first & second;
      }
    : function flagAndHighLow(first = EMPTY_FLAG, second = EMPTY_FLAG) {
          return first.and(second);
      };

const flagOr = satisfyTypeScript(EMPTY_FLAG)
    ? function flagOrBigInt(first = EMPTY_FLAG, second = EMPTY_FLAG) {
          return first | second;
      }
    : function flagOrHighLow(first = EMPTY_FLAG, second = EMPTY_FLAG) {
          return first.or(second);
      };

const flagXor = satisfyTypeScript(EMPTY_FLAG)
    ? function flagXorBigInt(first = EMPTY_FLAG, second = EMPTY_FLAG) {
          return first ^ second;
      }
    : function flagXorHighLow(first = EMPTY_FLAG, second = EMPTY_FLAG) {
          return first.xor(second);
      };

const flagNot = satisfyTypeScript(EMPTY_FLAG)
    ? function flagNotBigInt(first = EMPTY_FLAG) {
          return ~first;
      }
    : function flagNotHighLow(first = EMPTY_FLAG) {
          return first.not();
      };

const flagEquals = SUPPORTS_BIGINT
    ? function flagEqualsBigInt(first: bigint, second: bigint) {
          return first === second;
      }
    : function flagEqualsHighLow(first: HighLow, second: HighLow) {
          return first == null || second == null
              ? first == second
              : first.equals(second);
      };

type BigIntersection = bigint & HighLow;

function flagOrMultiple(...flags: BigIntersection[]) {
    let result = flags[0];

    for (let i = 1; i < flags.length; i++) {
        result = flagOr(result, flags[i]) as BigIntersection;
    }

    return result;
}

function flagHas(base: BigIntersection, flag: BigIntersection) {
    return flagEquals(flagAnd(base, flag) as BigIntersection, flag);
}

function flagHasAny(base: BigIntersection, flag: BigIntersection) {
    return !flagEquals(
        flagAnd(base, flag) as BigIntersection,
        EMPTY_FLAG as BigIntersection
    );
}

function flagAdd(base: BigIntersection, flag: BigIntersection) {
    return flag === EMPTY_FLAG ? base : flagOr(base, flag);
}

function flagRemove(base: BigIntersection, flag: BigIntersection) {
    return flag === EMPTY_FLAG
        ? base
        : flagXor(base, flagAnd(base, flag) as BigIntersection);
}

const getFlag = SUPPORTS_BIGINT
    ? function getFlagBigInt(index: string | number | bigint) {
          return BigInt(1) << BigInt(index);
      }
    : function getFlagHighLow(index: number) {
          return HighLow.fromBit(index);
      };

export const BigFlagUtils = {
    combine: flagOrMultiple,
    add: flagAdd,
    remove: flagRemove,
    filter: flagAnd,
    invert: flagNot,
    has: flagHas,
    hasAny: flagHasAny,
    equals: flagEquals,
    deserialize: convertToBigFlag,
    getFlag,
};

export function zodCoerceUnhandledValue(
    inputObject: Record<string, string | number> & { UNHANDLED: number }
) {
    return z.preprocess(arg => {
        let _a;
        const [objectKey] =
            (_a = Object.entries(inputObject).find(
                ([, value]) => value === arg
            )) !== null && _a !== void 0
                ? _a
                : [];
        if (arg != null && objectKey === undefined) {
            return inputObject.UNHANDLED;
        }
        return arg;
    }, z.string().or(z.number()));
}

function can(permission: BigIntersection, permissions: BigIntersection) {
    return BigFlagUtils.has(
        BigFlagUtils.deserialize(permissions) as BigIntersection,
        permission
    );
}

export const PermissionUtils = {
    can,
};
