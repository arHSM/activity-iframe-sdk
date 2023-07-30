import { BigFlagUtils } from "./utils";

export enum RPCCloseCodes {
    CLOSE_NORMAL = 1000,
    CLOSE_UNSUPPORTED = 1003,
    CLOSE_ABNORMAL = 1006,
    INVALID_CLIENTID = 4000,
    INVALID_ORIGIN = 4001,
    RATELIMITED = 4002,
    TOKEN_REVOKED = 4003,
    INVALID_VERSION = 4004,
    INVALID_ENCODING = 4005,
}

export enum RPCErrorCodes {
    INVALID_PAYLOAD = 4000,
    INVALID_COMMAND = 4002,
    INVALID_EVENT = 4004,
    INVALID_PERMISSIONS = 4006,
}

export enum Orientation {
    LANDSCAPE = "landscape",
    PORTRAIT = "portrait",
}

export enum Platform {
    MOBILE = "mobile",
    DESKTOP = "desktop",
}

export const Permissions = Object.freeze({
    CREATE_INSTANT_INVITE: BigFlagUtils.getFlag(0),
});

export { Events } from "./schema/events";

