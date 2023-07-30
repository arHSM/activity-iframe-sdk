import { infer as i } from "zod";

import * as Schema from "./index";

export type ClosePayloadType = i<typeof Schema.ClosePayload>;
export type IncomingPayloadType = i<typeof Schema.IncomingPayload>;

export type BaseEventType = i<typeof Schema.Events.BaseEvent>;
export type ErrorEventFrameType = i<typeof Schema.Events.ErrorEventFrame>;
export type ReadyType = i<typeof Schema.Events.Ready>;
export type GuildStatusType = i<typeof Schema.Events.GuildStatus>;
export type GuildCreateType = i<typeof Schema.Events.GuildCreate>;
export type ChannelCreateType = i<typeof Schema.Events.ChannelCreate>;
export type VoiceChannelSelectType = i<typeof Schema.Events.VoiceChannelSelect>;
export type VoiceSettingsUpdateType = i<typeof Schema.Events.VoiceSettingsUpdate>;
export type VoiceStateCreateType = i<typeof Schema.Events.VoiceStateCreate>;
export type VoiceStateUpdateType = i<typeof Schema.Events.VoiceStateUpdate>;
export type VoiceStateDeleteType = i<typeof Schema.Events.VoiceStateDelete>;
export type VoiceConnectionStatusType = i<typeof Schema.Events.VoiceConnectionStatus>;
export type MessageCreateType = i<typeof Schema.Events.MessageCreate>;
export type MessageUpdateType = i<typeof Schema.Events.MessageUpdate>;
export type MessageDeleteType = i<typeof Schema.Events.MessageDelete>;
export type SpeakingStartType = i<typeof Schema.Events.SpeakingStart>;
export type SpeakingStopType = i<typeof Schema.Events.SpeakingStop>;
export type NotificationCreateType = i<typeof Schema.Events.NotificationCreate>;
export type CaptureShortcutChangeType = i<typeof Schema.Events.CaptureShortcutChange>;
export type ActivityJoinType = i<typeof Schema.Events.ActivityJoin>;
export type ActivityJoinRequestType = i<typeof Schema.Events.ActivityJoinRequest>;
export type ActivityPIPModeUpdateType = i<typeof Schema.Events.ActivityPIPModeUpdate>;
export type ActivityLayoutModeUpdateType = i<typeof Schema.Events.ActivityLayoutModeUpdate>;
export type OrientationUpdateType = i<typeof Schema.Events.OrientationUpdate>;
export type CurrentUserUpdateType = i<typeof Schema.Events.CurrentUserUpdate>;
export type EntitlementCreateType = i<typeof Schema.Events.EntitlementCreate>;
export type ThermalStateUpdateType = i<typeof Schema.Events.ThermalStateUpdate>;

export type EventParsedType =
    | ErrorEventFrameType
    | ReadyType
    | GuildStatusType
    | GuildCreateType
    | ChannelCreateType
    | VoiceChannelSelectType
    | VoiceSettingsUpdateType
    | VoiceStateCreateType
    | VoiceStateUpdateType
    | VoiceStateDeleteType
    | VoiceConnectionStatusType
    | MessageCreateType
    | MessageUpdateType    
    | MessageDeleteType    
    | SpeakingStartType
    | SpeakingStopType
    | NotificationCreateType
    | CaptureShortcutChangeType
    | ActivityJoinType
    | ActivityJoinRequestType
    | ActivityPIPModeUpdateType
    | ActivityLayoutModeUpdateType
    | OrientationUpdateType
    | CurrentUserUpdateType
    | EntitlementCreateType
    | ThermalStateUpdateType;

export interface EventTypeMap {
    [Schema.Events.Events.READY]: ReadyType;
    [Schema.Events.Events.GUILD_STATUS]: GuildStatusType;
    [Schema.Events.Events.GUILD_CREATE]: GuildCreateType;
    [Schema.Events.Events.CHANNEL_CREATE]: ChannelCreateType;
    [Schema.Events.Events.VOICE_CHANNEL_SELECT]: VoiceChannelSelectType;
    [Schema.Events.Events.VOICE_SETTINGS_UPDATE]: VoiceSettingsUpdateType;
    [Schema.Events.Events.VOICE_STATE_CREATE]: VoiceStateCreateType;
    [Schema.Events.Events.VOICE_STATE_UPDATE]: VoiceStateUpdateType;
    [Schema.Events.Events.VOICE_STATE_DELETE]: VoiceStateDeleteType;
    [Schema.Events.Events.VOICE_CONNECTION_STATUS]: VoiceConnectionStatusType;
    [Schema.Events.Events.MESSAGE_CREATE]: MessageCreateType;
    [Schema.Events.Events.MESSAGE_UPDATE]: MessageUpdateType;
    [Schema.Events.Events.MESSAGE_DELETE]: MessageDeleteType;
    [Schema.Events.Events.SPEAKING_START]: SpeakingStartType;
    [Schema.Events.Events.SPEAKING_STOP]: SpeakingStopType;
    [Schema.Events.Events.NOTIFICATION_CREATE]: NotificationCreateType;
    [Schema.Events.Events.CAPTURE_SHORTCUT_CHANGE]: CaptureShortcutChangeType;
    [Schema.Events.Events.ACTIVITY_JOIN]: ActivityJoinType;
    [Schema.Events.Events.ACTIVITY_JOIN_REQUEST]: ActivityJoinRequestType;
    [Schema.Events.Events.ACTIVITY_PIP_MODE_UPDATE]: ActivityPIPModeUpdateType;
    [Schema.Events.Events.ACTIVITY_LAYOUT_MODE_UPDATE]: ActivityLayoutModeUpdateType;
    [Schema.Events.Events.ORIENTATION_UPDATE]: OrientationUpdateType;
    [Schema.Events.Events.CURRENT_USER_UPDATE]: CurrentUserUpdateType;
    [Schema.Events.Events.ENTITLEMENT_CREATE]: EntitlementCreateType;
    [Schema.Events.Events.THERMAL_STATE_UPDATE]: ThermalStateUpdateType;
}

export type EmptyResponseType = i<typeof Schema.Responses.EmptyResponse>;
export type AuthorizeResponseType = i<typeof Schema.Responses.AuthorizeResponse>;
export type AuthenticateResponseType = i<typeof Schema.Responses.AuthenticateResponse>;
export type GetGuildsResponseType = i<typeof Schema.Responses.GetGuildsResponse>;
export type GetGuildResponseType = i<typeof Schema.Responses.GetGuildResponse>;
export type GetChannelResponseType = i<typeof Schema.Responses.GetChannelResponse>;
export type GetChannelsResponseType = i<typeof Schema.Responses.GetChannelsResponse>;
export type SetUserVoiceSettingsResponseType = i<typeof Schema.Responses.SetUserVoiceSettingsResponse>;
export type NullableChannelResponseType = i<typeof Schema.Responses.NullableChannelResponse>;
export type SelectVoiceChannelResponseType = i<typeof Schema.Responses.SelectVoiceChannelResponse>;
export type GetSelectedVoiceChannelResponseType = i<typeof Schema.Responses.GetSelectedVoiceChannelResponse>;
export type SelectTextChannelResponseType = i<typeof Schema.Responses.SelectTextChannelResponse>;
export type VoiceSettingsResponseType = i<typeof Schema.Responses.VoiceSettingsResponse>;
export type SubscribeResponseType = i<typeof Schema.Responses.SubscribeResponse>;
export type CaptureShortcutResponseType = i<typeof Schema.Responses.CaptureShortcutResponse>;
export type SetActivityResponseType = i<typeof Schema.Responses.SetActivityResponse>;
export type GetSkusResponseType = i<typeof Schema.Responses.GetSkusResponse>;
export type GetEntitlementsResponseType = i<typeof Schema.Responses.GetEntitlementsResponse>;
export type StartPurchaseResponseType = i<typeof Schema.Responses.StartPurchaseResponse>;
export type SetConfigResponseType = i<typeof Schema.Responses.SetConfigResponse>;
export type UserSettingsGetLocaleResponseType = i<typeof Schema.Responses.UserSettingsGetLocaleResponse>;
export type EncourageHardwareAccelerationResponseType = i<typeof Schema.Responses.EncourageHardwareAccelerationResponse>;
export type GetChannelPermissionsResponseType = i<typeof Schema.Responses.GetChannelPermissionsResponse>;
export type InitiateImageUploadResponseType = i<typeof Schema.Responses.InitiateImageUploadResponse>;
export type GetPlatformBehaviorsResponseType = i<typeof Schema.Responses.GetPlatformBehaviorsResponse>;
export type ResponseFrameType = i<typeof Schema.Responses.ResponseFrame>;

export type ResponseParsedDataType =
    | EmptyResponseType
    | AuthorizeResponseType
    | AuthenticateResponseType
    | GetGuildsResponseType
    | GetGuildResponseType
    | GetChannelResponseType
    | GetChannelsResponseType
    | SetUserVoiceSettingsResponseType
    | NullableChannelResponseType
    | SelectVoiceChannelResponseType
    | GetSelectedVoiceChannelResponseType
    | SelectTextChannelResponseType
    | VoiceSettingsResponseType
    | SubscribeResponseType
    | CaptureShortcutResponseType
    | SetActivityResponseType
    | GetSkusResponseType
    | GetEntitlementsResponseType
    | StartPurchaseResponseType
    | SetConfigResponseType
    | UserSettingsGetLocaleResponseType
    | EncourageHardwareAccelerationResponseType
    | GetChannelPermissionsResponseType
    | InitiateImageUploadResponseType
    | GetPlatformBehaviorsResponseType;

export type SendCommandFunction = (payload: IncomingPayloadType) => Promise<any>;
