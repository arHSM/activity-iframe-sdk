import { ZodType, z } from "zod";

import { Orientation } from "../Constants";
import { zodCoerceUnhandledValue } from "../utils";
import {
    ChannelTypesObject,
    Commands,
    DISPATCH,
    Entitlement,
    Guild,
    LayoutModeTypeObject,
    Message,
    OrientationTypeObject,
    ReceiveFramePayload,
    ShortcutKey,
    ThermalState,
    User,
    VoiceState,
} from "./common";
import { VoiceSettingsResponse } from "./responses";
import { BaseEventType, EventParsedType } from "./types";

export const ERROR = "ERROR";

export enum Events {
    READY = "READY",
    GUILD_STATUS = "GUILD_STATUS",
    GUILD_CREATE = "GUILD_CREATE",
    CHANNEL_CREATE = "CHANNEL_CREATE",
    VOICE_CHANNEL_SELECT = "VOICE_CHANNEL_SELECT",
    VOICE_SETTINGS_UPDATE = "VOICE_SETTINGS_UPDATE",
    VOICE_STATE_CREATE = "VOICE_STATE_CREATE",
    VOICE_STATE_UPDATE = "VOICE_STATE_UPDATE",
    VOICE_STATE_DELETE = "VOICE_STATE_DELETE",
    VOICE_CONNECTION_STATUS = "VOICE_CONNECTION_STATUS",
    MESSAGE_CREATE = "MESSAGE_CREATE",
    MESSAGE_UPDATE = "MESSAGE_UPDATE",
    MESSAGE_DELETE = "MESSAGE_DELETE",
    SPEAKING_START = "SPEAKING_START",
    SPEAKING_STOP = "SPEAKING_STOP",
    NOTIFICATION_CREATE = "NOTIFICATION_CREATE",
    CAPTURE_SHORTCUT_CHANGE = "CAPTURE_SHORTCUT_CHANGE",
    ACTIVITY_JOIN = "ACTIVITY_JOIN",
    ACTIVITY_JOIN_REQUEST = "ACTIVITY_JOIN_REQUEST",
    ACTIVITY_PIP_MODE_UPDATE = "ACTIVITY_PIP_MODE_UPDATE",
    ACTIVITY_LAYOUT_MODE_UPDATE = "ACTIVITY_LAYOUT_MODE_UPDATE",
    ORIENTATION_UPDATE = "ORIENTATION_UPDATE",
    CURRENT_USER_UPDATE = "CURRENT_USER_UPDATE",
    ENTITLEMENT_CREATE = "ENTITLEMENT_CREATE",
    THERMAL_STATE_UPDATE = "THERMAL_STATE_UPDATE",
}

export const ErrorEventFrame = ReceiveFramePayload.extend({
    evt: z.literal(ERROR),
    data: z
        .object({
            code: z.number(),
            message: z.string().optional(),
        })
        .passthrough(),
    cmd: z.nativeEnum(Commands),
    nonce: z.string().nullable(),
});

export const EventFrame = ReceiveFramePayload.extend({
    evt: z.nativeEnum(Events),
    nonce: z.string().nullable(),
    cmd: z.literal(DISPATCH),
    data: z.object({}).passthrough(),
});

export const UnknownEventFrame = EventFrame.extend({
    evt: z.string(),
});

export const BaseEvent = z.union([
    EventFrame,
    UnknownEventFrame,
    ErrorEventFrame,
]);

function makeEvent<E extends Events, D extends Record<string, ZodType>>(
    event: E,
    data: D
) {
    return EventFrame.extend({
        evt: z.literal(event),
        data: z.object(data),
    });
}

export const Ready = makeEvent(Events.READY, {
    v: z.number(),
    config: z.object({
        cdn_host: z.string().optional(),
        api_endpoint: z.string(),
        environment: z.string(),
    }),
    user: z
        .object({
            id: z.string(),
            username: z.string(),
            discriminator: z.string(),
            avatar: z.string().optional(),
        })
        .optional(),
});

export const GuildStatus = makeEvent(Events.GUILD_STATUS, {
    guild: Guild,
    online: z.number().optional(),
});

export const GuildCreate = makeEvent(Events.GUILD_CREATE, {
    id: z.string(),
    name: z.string(),
});

export const ChannelCreate = makeEvent(Events.CHANNEL_CREATE, {
    id: z.string(),
    name: z.string(),
    type: zodCoerceUnhandledValue(ChannelTypesObject),
});

export const VoiceChannelSelect = makeEvent(Events.VOICE_CHANNEL_SELECT, {
    channel_id: z.string().nullable(),
    guild_id: z.string().nullable().optional(),
});

export const VoiceSettingsUpdate = makeEvent(Events.VOICE_STATE_UPDATE, {
    data: VoiceSettingsResponse,
});

export const VoiceStateCreate = makeEvent(Events.VOICE_STATE_CREATE, {
    voice_state: VoiceState,
    user: User,
    nick: z.string(),
    volume: z.number(),
    mute: z.boolean(),
    pan: z.object({
        left: z.number(),
        right: z.number(),
    }),
});

export const VoiceStateUpdate = VoiceStateCreate.extend({
    evt: z.literal(Events.VOICE_STATE_UPDATE),
});

export const VoiceStateDelete = VoiceStateCreate.extend({
    evt: z.literal(Events.VOICE_STATE_DELETE),
});

export const VoiceConnectionStateTypeObject = {
    UNHANDLED: -1,
    DISCONNECTED: "DISCONNECTED",
    AWAITING_ENDPOINT: "AWAITING_ENDPOINT",
    AUTHENTICATING: "AUTHENTICATING",
    CONNECTING: "CONNECTING",
    CONNECTED: "CONNECTED",
    VOICE_DISCONNECTED: "VOICE_DISCONNECTED",
    VOICE_CONNECTING: "VOICE_CONNECTING",
    VOICE_CONNECTED: "VOICE_CONNECTED",
    NO_ROUTE: "NO_ROUTE",
    ICE_CHECKING: "ICE_CHECKING",
};

export const VoiceConnectionStatus = makeEvent(Events.VOICE_CONNECTION_STATUS, {
    state: zodCoerceUnhandledValue(VoiceConnectionStateTypeObject),
    hostname: z.string(),
    pings: z.array(z.number()),
    average_ping: z.number(),
    last_ping: z.number(),
});

export const MessageCreate = makeEvent(Events.MESSAGE_CREATE, {
    channel_id: z.string(),
    message: Message,
});

export const MessageUpdate = MessageCreate.extend({
    evt: z.literal(Events.MESSAGE_UPDATE),
});

export const MessageDelete = MessageCreate.extend({
    evt: z.literal(Events.MESSAGE_DELETE),
});

export const SpeakingStart = makeEvent(Events.SPEAKING_START, {
    user_id: z.string(),
});

export const SpeakingStop = makeEvent(Events.SPEAKING_STOP, {
    user_id: z.string(),
});

export const NotificationCreate = makeEvent(Events.NOTIFICATION_CREATE, {
    channel_id: z.string(),
    message: Message,
    icon_url: z.string(),
    title: z.string(),
    body: z.string(),
});

export const CaptureShortcutChange = makeEvent(Events.CAPTURE_SHORTCUT_CHANGE, {
    shortcut: ShortcutKey,
});

export const ActivityIntentTypeObject = {
    UNHANDLED: -1,
    PLAY: 0,
    SPECTATE: 1,
};

export const ActivityJoin = makeEvent(Events.ACTIVITY_JOIN, {
    secret: z.string(),
    intent: zodCoerceUnhandledValue(ActivityIntentTypeObject).optional(),
});

export const ActivityJoinRequest = makeEvent(Events.ACTIVITY_JOIN_REQUEST, {
    user: User,
});

export const ActivityPIPModeUpdate = makeEvent(
    Events.ACTIVITY_PIP_MODE_UPDATE,
    {
        is_pip_mode: z.boolean(),
    }
);

export const ActivityLayoutModeUpdate = makeEvent(
    Events.ACTIVITY_LAYOUT_MODE_UPDATE,
    {
        layout_mode: zodCoerceUnhandledValue(LayoutModeTypeObject),
    }
);

export const OrientationUpdate = makeEvent(Events.ORIENTATION_UPDATE, {
    screen_orientation: zodCoerceUnhandledValue(OrientationTypeObject),
    orientation: z.nativeEnum(Orientation),
});

export const CurrentUserUpdate = makeEvent(Events.CURRENT_USER_UPDATE, {
    avatar: z.string().optional().nullable(),
    bot: z.boolean(),
    discriminator: z.string(),
    flags: z.number().optional().nullable(),
    id: z.string(),
    premium_type: z.number().optional().nullable(),
    username: z.string(),
});

export const EntitlementCreate = makeEvent(Events.ENTITLEMENT_CREATE, {
    entitlement: Entitlement,
});

export const ThermalStateUpdate = makeEvent(Events.THERMAL_STATE_UPDATE, {
    thermal_state: ThermalState,
});

export function parseEventPayload(payload: BaseEventType): EventParsedType {
    switch (payload.evt) {
        case Events.ACTIVITY_JOIN:
            return ActivityJoin.parse(payload);
        case Events.ACTIVITY_JOIN_REQUEST:
            return ActivityJoinRequest.parse(payload);
        case Events.ACTIVITY_PIP_MODE_UPDATE:
            return ActivityPIPModeUpdate.parse(payload);
        case Events.ACTIVITY_LAYOUT_MODE_UPDATE:
            return ActivityLayoutModeUpdate.parse(payload);
        case Events.CAPTURE_SHORTCUT_CHANGE:
            return CaptureShortcutChange.parse(payload);
        case Events.CHANNEL_CREATE:
            return ChannelCreate.parse(payload);
        case ERROR:
            return ErrorEventFrame.parse(payload);
        case Events.GUILD_CREATE:
            return GuildCreate.parse(payload);
        case Events.GUILD_STATUS:
            return GuildStatus.parse(payload);
        case Events.MESSAGE_CREATE:
            return MessageCreate.parse(payload);
        case Events.MESSAGE_DELETE:
            return MessageDelete.parse(payload);
        case Events.MESSAGE_UPDATE:
            return MessageUpdate.parse(payload);
        case Events.NOTIFICATION_CREATE:
            return NotificationCreate.parse(payload);
        case Events.ORIENTATION_UPDATE:
            return OrientationUpdate.parse(payload);
        case Events.READY:
            return Ready.parse(payload);
        case Events.SPEAKING_START:
            return SpeakingStart.parse(payload);
        case Events.SPEAKING_STOP:
            return SpeakingStop.parse(payload);
        case Events.VOICE_CHANNEL_SELECT:
            return VoiceChannelSelect.parse(payload);
        case Events.VOICE_CONNECTION_STATUS:
            return VoiceConnectionStatus.parse(payload);
        case Events.VOICE_SETTINGS_UPDATE:
            return VoiceSettingsUpdate.parse(payload);
        case Events.VOICE_STATE_CREATE:
            return VoiceStateCreate.parse(payload);
        case Events.VOICE_STATE_DELETE:
            return VoiceStateDelete.parse(payload);
        case Events.VOICE_STATE_UPDATE:
            return VoiceStateUpdate.parse(payload);
        case Events.CURRENT_USER_UPDATE:
            return CurrentUserUpdate.parse(payload);
        case Events.ENTITLEMENT_CREATE:
            return EntitlementCreate.parse(payload);
        case Events.THERMAL_STATE_UPDATE:
            return ThermalStateUpdate.parse(payload);
        default:
            throw new Error(`Unrecognized event type ${payload.evt}`);
    }
}
