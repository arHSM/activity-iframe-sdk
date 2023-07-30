import { z } from "zod";

import { Platform } from "../Constants";
import { BaseEvent, parseEventPayload } from "./events";
import { ResponseFrame, parseResponsePayload } from "./responses";
import { IncomingPayloadType } from "./types";

export * as Common from "./common";
export * as Events from "./events";
export * as Responses from "./responses";

export const HelloPayload = z.object({
    frame_id: z.string(),
    platform: z.nativeEnum(Platform).optional().nullable(),
});

export const ConnectPayload = z.object({
    v: z.literal(1),
    encoding: z.literal("json").optional(),
    client_id: z.string(),
    frame_id: z.string(),
});

export const ClosePayload = z.object({
    code: z.number(),
    message: z.string().optional(),
});

export const IncomingPayload = z
    .object({
        evt: z.string().nullable(),
        nonce: z.string().nullable(),
        data: z.unknown().nullable(),
        cmd: z.string(),
    })
    .passthrough();

export function parseIncomingPayload(payload: IncomingPayloadType) {
    const incoming = IncomingPayload.parse(payload);

    return incoming.evt != null
        ? parseEventPayload(BaseEvent.parse(incoming))
        : parseResponsePayload(ResponseFrame.passthrough().parse(incoming));
}
