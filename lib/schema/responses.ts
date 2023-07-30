import { z } from "zod";

import { zodCoerceUnhandledValue } from "../utils";
import {
    Activity,
    Channel,
    ChannelTypesObject,
    Commands,
    Entitlement,
    GuildMember,
    Message,
    ReceiveFramePayload,
    Scopes,
    ShortcutKey,
    Sku,
    UserVoiceState,
    VoiceSettingsIO,
    VoiceSettingsMode,
} from "./common";
import { ResponseFrameType, ResponseParsedDataType } from "./types";

export const EmptyResponse = z.object({}).nullable();

export const AuthorizeResponse = z.object({
    code: z.string(),
});

export const AuthenticateResponse = z.object({
    access_token: z.string(),
    user: z.object({
        username: z.string(),
        discriminator: z.string(),
        id: z.string(),
        avatar: z.string().nullable(),
        public_flags: z.number(),
    }),
    scopes: z.array(Scopes),
    expires: z.string(),
    application: z.object({
        description: z.string(),
        icon: z.string().nullable(),
        id: z.string(),
        rpc_origins: z.array(z.string()).optional(),
        name: z.string(),
    }),
});

export const GetGuildsResponse = z.object({
    guilds: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
        })
    ),
});

export const GetGuildResponse = z.object({
    id: z.string(),
    name: z.string(),
    icon_url: z.string().optional(),
    members: z.array(GuildMember),
});

export const GetChannelResponse = z.object({
    id: z.string(),
    type: zodCoerceUnhandledValue(ChannelTypesObject),
    guild_id: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    topic: z.string().optional().nullable(),
    bitrate: z.number().optional().nullable(),
    user_limit: z.number().optional().nullable(),
    position: z.number().optional().nullable(),
    voice_states: z.array(UserVoiceState),
    messages: z.array(Message),
});

export const GetChannelsResponse = z.object({
    channels: z.array(Channel),
});

export const SetUserVoiceSettingsResponse = z.object({
    user_id: z.string(),
    pan: z
        .object({
            left: z.number(),
            right: z.number(),
        })
        .optional(),
    volume: z.number().optional(),
    mute: z.boolean().optional(),
});

export const NullableChannelResponse = GetChannelResponse.nullable();

export const SelectVoiceChannelResponse = GetChannelResponse.nullable();

export const GetSelectedVoiceChannelResponse = GetChannelResponse.nullable();

export const SelectTextChannelResponse = GetChannelResponse.nullable();

export const VoiceSettingsResponse = z.object({
    input: VoiceSettingsIO,
    output: VoiceSettingsIO,
    mode: VoiceSettingsMode,
    automatic_gain_control: z.boolean(),
    echo_cancellation: z.boolean(),
    noise_suppression: z.boolean(),
    qos: z.boolean(),
    silence_warning: z.boolean(),
    deaf: z.boolean(),
    mute: z.boolean(),
});

export const SubscribeResponse = z.object({
    evt: z.string(),
});

export const CaptureShortcutResponse = z.object({
    shortcut: ShortcutKey,
});

export const SetActivityResponse = Activity;

export const GetSkusResponse = z.object({
    skus: z.array(Sku),
});

export const GetEntitlementsResponse = z.object({
    entitlements: z.array(Entitlement),
});

export const StartPurchaseResponse = z.array(Entitlement).nullable();

export const SetConfigResponse = z.object({
    use_interactive_pip: z.boolean(),
});

export const UserSettingsGetLocaleResponse = z.object({
    locale: z.string(),
});
export const EncourageHardwareAccelerationResponse = z.object({
    enabled: z.boolean(),
});
export const GetChannelPermissionsResponse = z.object({
    permissions: z.bigint().or(z.string()),
});
export const InitiateImageUploadResponse = z
    .object({
        image_url: z.string(),
    })
    .nullable();

export const GetPlatformBehaviorsResponse = z.object({
    iosKeyboardResizesView: z.optional(z.boolean()),
});

export const ResponseFrame = ReceiveFramePayload.extend({
    cmd: z.nativeEnum(Commands),
    evt: z.null(),
});

function parseResponsePayloadData({
    cmd,
    data,
}: ResponseFrameType): ResponseParsedDataType {
    switch (cmd) {
        case Commands.AUTHENTICATE:
            return AuthenticateResponse.parse(data);
        case Commands.AUTHORIZE:
            return AuthorizeResponse.parse(data);
        case Commands.CAPTURE_SHORTCUT:
            return CaptureShortcutResponse.parse(data);
        case Commands.ENCOURAGE_HW_ACCELERATION:
            return EncourageHardwareAccelerationResponse.parse(data);
        case Commands.GET_CHANNEL:
            return GetChannelResponse.parse(data);
        case Commands.GET_CHANNELS:
            return GetChannelsResponse.parse(data);
        case Commands.GET_CHANNEL_PERMISSIONS:
            return GetChannelPermissionsResponse.parse(data);
        case Commands.GET_GUILD:
            return GetGuildResponse.parse(data);
        case Commands.GET_GUILDS:
            return GetGuildsResponse.parse(data);
        case Commands.GET_PLATFORM_BEHAVIORS:
            return GetPlatformBehaviorsResponse.parse(data);
        case Commands.GET_SELECTED_VOICE_CHANNEL:
            return GetSelectedVoiceChannelResponse.parse(data);
        case Commands.GET_VOICE_SETTINGS:
        case Commands.SET_VOICE_SETTINGS:
            return VoiceSettingsResponse.parse(data);
        case Commands.SELECT_TEXT_CHANNEL:
            return SelectTextChannelResponse.parse(data);
        case Commands.SELECT_VOICE_CHANNEL:
            return SelectVoiceChannelResponse.parse(data);
        case Commands.SET_ACTIVITY:
            return SetActivityResponse.parse(data);
        case Commands.GET_SKUS_EMBEDDED:
            return GetSkusResponse.parse(data);
        case Commands.GET_ENTITLEMENTS_EMBEDDED:
            return GetEntitlementsResponse.parse(data);
        case Commands.SET_CONFIG:
            return SetConfigResponse.parse(data);
        case Commands.SET_USER_VOICE_SETTINGS:
            return SetUserVoiceSettingsResponse.parse(data);
        case Commands.START_PURCHASE:
            return StartPurchaseResponse.parse(data);
        case Commands.SUBSCRIBE:
        case Commands.UNSUBSCRIBE:
            return SubscribeResponse.parse(data);
        case Commands.USER_SETTINGS_GET_LOCALE:
            return UserSettingsGetLocaleResponse.parse(data);
        case Commands.INITIATE_IMAGE_UPLOAD:
            return InitiateImageUploadResponse.parse(data);
        case Commands.START_PREMIUM_PURCHASE:
        case Commands.OPEN_EXTERNAL_LINK:
        case Commands.SET_ORIENTATION_LOCK_STATE:
        case Commands.SET_CERTIFIED_DEVICES:
        case Commands.SEND_ANALYTICS_EVENT:
        case Commands.OPEN_INVITE_DIALOG:
        case Commands.CAPTURE_LOG:
        case Commands.OPEN_SHARE_MOMENT_DIALOG:
            return EmptyResponse.parse(data);
        default:
            throw new Error(`Unrecognized command ${cmd}`);
    }
}

export function parseResponsePayload(payload: ResponseFrameType) {
    return Object.assign(Object.assign({}, payload), {
        data: parseResponsePayloadData(payload),
    });
}
