import { z } from "zod";

import { zodCoerceUnhandledValue } from "../utils";

export const DISPATCH = "DISPATCH";

export enum Commands {
    AUTHORIZE = "AUTHORIZE",
    AUTHENTICATE = "AUTHENTICATE",
    GET_GUILDS = "GET_GUILDS",
    GET_GUILD = "GET_GUILD",
    GET_CHANNEL = "GET_CHANNEL",
    GET_CHANNELS = "GET_CHANNELS",
    SET_USER_VOICE_SETTINGS = "SET_USER_VOICE_SETTINGS",
    SELECT_VOICE_CHANNEL = "SELECT_VOICE_CHANNEL",
    GET_SELECTED_VOICE_CHANNEL = "GET_SELECTED_VOICE_CHANNEL",
    SELECT_TEXT_CHANNEL = "SELECT_TEXT_CHANNEL",
    GET_VOICE_SETTINGS = "GET_VOICE_SETTINGS",
    SET_VOICE_SETTINGS = "SET_VOICE_SETTINGS",
    SUBSCRIBE = "SUBSCRIBE",
    UNSUBSCRIBE = "UNSUBSCRIBE",
    CAPTURE_SHORTCUT = "CAPTURE_SHORTCUT",
    SET_CERTIFIED_DEVICES = "SET_CERTIFIED_DEVICES",
    SET_ACTIVITY = "SET_ACTIVITY",
    GET_SKUS = "GET_SKUS",
    GET_ENTITLEMENTS = "GET_ENTITLEMENTS",
    GET_SKUS_EMBEDDED = "GET_SKUS_EMBEDDED",
    GET_ENTITLEMENTS_EMBEDDED = "GET_ENTITLEMENTS_EMBEDDED",
    START_PURCHASE = "START_PURCHASE",
    START_PREMIUM_PURCHASE = "START_PREMIUM_PURCHASE",
    SET_CONFIG = "SET_CONFIG",
    SEND_ANALYTICS_EVENT = "SEND_ANALYTICS_EVENT",
    USER_SETTINGS_GET_LOCALE = "USER_SETTINGS_GET_LOCALE",
    OPEN_EXTERNAL_LINK = "OPEN_EXTERNAL_LINK",
    ENCOURAGE_HW_ACCELERATION = "ENCOURAGE_HW_ACCELERATION",
    CAPTURE_LOG = "CAPTURE_LOG",
    SET_ORIENTATION_LOCK_STATE = "SET_ORIENTATION_LOCK_STATE",
    OPEN_INVITE_DIALOG = "OPEN_INVITE_DIALOG",
    GET_PLATFORM_BEHAVIORS = "GET_PLATFORM_BEHAVIORS",
    GET_CHANNEL_PERMISSIONS = "GET_CHANNEL_PERMISSIONS",
    OPEN_SHARE_MOMENT_DIALOG = "OPEN_SHARE_MOMENT_DIALOG",
    INITIATE_IMAGE_UPLOAD = "INITIATE_IMAGE_UPLOAD",
}

export const ReceiveFramePayload = z
    .object({
        cmd: z.string(),
        data: z.unknown(),
        evt: z.null(),
        nonce: z.string(),
    })
    .passthrough();

export const ScopesObject = {
    UNHANDLED: -1,
    bot: "bot",
    rpc: "rpc",
    identify: "identify",
    connections: "connections",
    email: "email",
    guilds: "guilds",
    "guilds.join": "guilds.join",
    "guilds.members.read": "guilds.members.read",
    "gdm.join": "gdm.join",
    "messages.read": "messages.read",
    "rpc.notifications.read": "rpc.notifications.read",
    "rpc.voice.write": "rpc.voice.write",
    "rpc.voice.read": "rpc.voice.read",
    "rpc.activities.write": "rpc.activities.write",
    "webhook.incoming": "webhook.incoming",
    "applications.builds.upload": "applications.builds.upload",
    "applications.builds.read": "applications.builds.read",
    "applications.store.update": "applications.store.update",
    "applications.entitlements": "applications.entitlements",
    "relationships.read": "relationships.read",
    "activities.read": "activities.read",
    "activities.write": "activities.write",
};

export const Scopes = zodCoerceUnhandledValue(ScopesObject);

export const User = z.object({
    id: z.string(),
    username: z.string(),
    discriminator: z.string(),
    avatar: z.string().optional().nullable(),
    publicFlags: z.number().optional().nullable(),
});

export const GuildMember = z.object({
    user: User,
    nick: z.string().optional().nullable(),
    roles: z.array(z.string()),
    joined_at: z.string(),
    deaf: z.boolean(),
    mute: z.boolean(),
});

export const Emoji = z.object({
    id: z.string(),
    name: z.string().optional().nullable(),
    roles: z.array(z.string()).optional().nullable(),
    user: User.optional().nullable(),
    require_colons: z.boolean().optional().nullable(),
    managed: z.boolean().optional().nullable(),
    animated: z.boolean().optional().nullable(),
    available: z.boolean().optional().nullable(),
});

export const VoiceState = z.object({
    mute: z.boolean(),
    deaf: z.boolean(),
    self_mute: z.boolean(),
    self_deaf: z.boolean(),
    suppress: z.boolean(),
});

export const UserVoiceState = z.object({
    mute: z.boolean(),
    nick: z.string(),
    user: User,
    voice_state: VoiceState,
    volume: z.number(),
});

export const StatusObject = {
    UNHANDLED: -1,
    IDLE: "idle",
    DND: "dnd",
    ONLINE: "online",
    OFFLINE: "offline",
};

export const Status = zodCoerceUnhandledValue(StatusObject);

export const Activity = z.object({
    name: z.string(),
    type: z.number(),
    url: z.string().optional().nullable(),
    created_at: z.number().optional().nullable(),
    timestamps: z
        .object({
            start: z.number(),
            end: z.number(),
        })
        .partial()
        .optional()
        .nullable(),
    application_id: z.string().optional().nullable(),
    details: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    emoji: Emoji.optional().nullable(),
    party: z
        .object({
            id: z.string().optional().nullable(),
            size: z.array(z.number()).optional().nullable(),
        })
        .optional()
        .nullable(),
    assets: z
        .object({
            large_image: z.string().nullable(),
            large_text: z.string().nullable(),
            small_image: z.string().nullable(),
            small_text: z.string().nullable(),
        })
        .partial()
        .optional()
        .nullable(),
    secrets: z
        .object({
            join: z.string(),
            match: z.string(),
        })
        .partial()
        .optional()
        .nullable(),
    instance: z.boolean().optional().nullable(),
    flags: z.number().optional().nullable(),
});

export const PermissionOverwriteTypeObject = {
    UNHANDLED: -1,
    ROLE: 0,
    MEMBER: 1,
};

export const PermissionOverwrite = z.object({
    id: z.string(),
    type: zodCoerceUnhandledValue(PermissionOverwriteTypeObject),
    allow: z.string(),
    deny: z.string(),
});

export const ChannelTypesObject = {
    UNHANDLED: -1,
    DM: 1,
    GROUP_DM: 3,
    GUILD_TEXT: 0,
    GUILD_VOICE: 2,
    GUILD_CATEGORY: 4,
    GUILD_ANNOUNCEMENT: 5,
    GUILD_STORE: 6,
    ANNOUNCEMENT_THREAD: 10,
    PUBLIC_THREAD: 11,
    PRIVATE_THREAD: 12,
    GUILD_STAGE_VOICE: 13,
    GUILD_DIRECTORY: 14,
    GUILD_FORUM: 15,
};

export const Channel = z.object({
    id: z.string(),
    type: zodCoerceUnhandledValue(ChannelTypesObject),
    guild_id: z.string().optional().nullable(),
    position: z.number().optional().nullable(),
    permission_overwrites: z.array(PermissionOverwrite).optional().nullable(),
    name: z.string().optional().nullable(),
    topic: z.string().optional().nullable(),
    nsfw: z.boolean().optional().nullable(),
    last_message_id: z.string().optional().nullable(),
    bitrate: z.number().optional().nullable(),
    user_limit: z.number().optional().nullable(),
    rate_limit_per_user: z.number().optional().nullable(),
    recipients: z.array(User).optional().nullable(),
    icon: z.string().optional().nullable(),
    owner_id: z.string().optional().nullable(),
    application_id: z.string().optional().nullable(),
    parent_id: z.string().optional().nullable(),
    last_pin_timestamp: z.string().optional().nullable(),
});

export const PresenceUpdate = z.object({
    user: User,
    guild_id: z.string(),
    status: Status,
    activities: z.array(Activity),
    client_status: z
        .object({
            desktop: Status,
            mobile: Status,
            web: Status,
        })
        .partial(),
});

export const Role = z.object({
    id: z.string(),
    name: z.string(),
    color: z.number(),
    hoist: z.boolean(),
    position: z.number(),
    permissions: z.string(),
    managed: z.boolean(),
    mentionable: z.boolean(),
});

export const Guild = z.object({
    id: z.string(),
    name: z.string(),
    owner_id: z.string(),
    icon: z.string().nullable(),
    icon_hash: z.string().optional().nullable(),
    splash: z.string().nullable(),
    discovery_splash: z.string().nullable(),
    owner: z.boolean().optional().nullable(),
    permissions: z.string().optional().nullable(),
    region: z.string(),
    afk_channel_id: z.string().nullable(),
    afk_timeout: z.number(),
    widget_enabled: z.boolean().optional().nullable(),
    widget_channel_id: z.string().optional().nullable(),
    verification_level: z.number(),
    default_message_notifications: z.number(),
    explicit_content_filter: z.number(),
    roles: z.array(Role),
    emojis: z.array(Emoji),
    features: z.array(z.string()),
    mfa_level: z.number(),
    application_id: z.string().nullable(),
    system_channel_id: z.string().nullable(),
    system_channel_flags: z.number(),
    rules_channel_id: z.string().nullable(),
    joined_at: z.string().optional().nullable(),
    large: z.boolean().optional().nullable(),
    unavailable: z.boolean().optional().nullable(),
    member_count: z.number().optional().nullable(),
    voice_states: z.array(VoiceState).optional().nullable(),
    members: z.array(GuildMember).optional().nullable(),
    channels: z.array(Channel).optional().nullable(),
    presences: z.array(PresenceUpdate).optional().nullable(),
    max_presences: z.number().optional().nullable(),
    max_members: z.number().optional().nullable(),
    vanity_url_code: z.string().nullable(),
    description: z.string().nullable(),
    banner: z.string().nullable(),
    premium_tier: z.number(),
    premium_subscription_count: z.number().optional().nullable(),
    preferred_locale: z.string(),
    public_updates_channel_id: z.string().nullable(),
    max_video_channel_users: z.number().optional().nullable(),
    approximate_member_count: z.number().optional().nullable(),
    approximate_presence_count: z.number().optional().nullable(),
});

export const ChannelMention = z.object({
    id: z.string(),
    guild_id: z.string(),
    type: z.number(),
    name: z.string(),
});

export const Attachment = z.object({
    id: z.string(),
    filename: z.string(),
    size: z.number(),
    url: z.string(),
    proxy_url: z.string(),
    height: z.number().optional().nullable(),
    width: z.number().optional().nullable(),
});

export const EmbedFooter = z.object({
    text: z.string(),
    icon_url: z.string().optional().nullable(),
    proxy_icon_url: z.string().optional().nullable(),
});

export const Image = z.object({
    url: z.string().optional().nullable(),
    proxy_url: z.string().optional().nullable(),
    height: z.number().optional().nullable(),
    width: z.number().optional().nullable(),
});

export const Video = Image.omit({
    proxy_url: true,
});

export const EmbedProvider = z.object({
    name: z.string().optional().nullable(),
    url: z.string().optional().nullable(),
});

export const EmbedAuthor = z.object({
    name: z.string().optional().nullable(),
    url: z.string().optional().nullable(),
    icon_url: z.string().optional().nullable(),
    proxy_icon_url: z.string().optional().nullable(),
});

export const EmbedField = z.object({
    name: z.string(),
    value: z.string(),
    inline: z.boolean(),
});

export const Embed = z.object({
    title: z.string().optional().nullable(),
    type: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    url: z.string().optional().nullable(),
    timestamp: z.string().optional().nullable(),
    color: z.number().optional().nullable(),
    footer: EmbedFooter.optional().nullable(),
    image: Image.optional().nullable(),
    thumbnail: Image.optional().nullable(),
    video: Video.optional().nullable(),
    provider: EmbedProvider.optional().nullable(),
    author: EmbedAuthor.optional().nullable(),
    fields: z.array(EmbedField).optional().nullable(),
});

export const Reaction = z.object({
    count: z.number(),
    me: z.boolean(),
    emoji: Emoji,
});

export const MessageActivity = z.object({
    type: z.number(),
    party_id: z.string().optional().nullable(),
});

export const MessageApplication = z.object({
    id: z.string(),
    cover_image: z.string().optional().nullable(),
    description: z.string(),
    icon: z.string().optional().nullable(),
    name: z.string(),
});

export const MessageReference = z.object({
    message_id: z.string().optional().nullable(),
    channel_id: z.string().optional().nullable(),
    guild_id: z.string().optional().nullable(),
});

export const Message = z.object({
    id: z.string(),
    channel_id: z.string(),
    guild_id: z.string().optional().nullable(),
    author: User.optional().nullable(),
    member: GuildMember.optional().nullable(),
    content: z.string(),
    timestamp: z.string(),
    edited_timestamp: z.string().optional().nullable(),
    tts: z.boolean(),
    mention_everyone: z.boolean(),
    mentions: z.array(User),
    mention_roles: z.array(z.string()),
    mention_channels: z.array(ChannelMention),
    attachments: z.array(Attachment),
    embeds: z.array(Embed),
    reactions: z.array(Reaction).optional().nullable(),
    nonce: z.union([z.string(), z.number()]).optional().nullable(),
    pinned: z.boolean(),
    webhook_id: z.string().optional().nullable(),
    type: z.number(),
    activity: MessageActivity.optional().nullable(),
    application: MessageApplication.optional().nullable(),
    message_reference: MessageReference.optional().nullable(),
    flags: z.number().optional().nullable(),
    stickers: z.array(z.unknown()).optional().nullable(),
    referenced_message: z.unknown().optional().nullable(),
});

export const VoiceDevice = z.object({
    id: z.string(),
    name: z.string(),
});

export const KeyTypesObject = {
    UNHANDLED: -1,
    KEYBOARD_KEY: 0,
    MOUSE_BUTTON: 1,
    KEYBOARD_MODIFIER_KEY: 2,
    GAMEPAD_BUTTON: 3,
};

export const ShortcutKey = z.object({
    type: zodCoerceUnhandledValue(KeyTypesObject),
    code: z.number(),
    name: z.string(),
});

export const VoiceSettingModeTypeObject = {
    UNHANDLED: -1,
    PUSH_TO_TALK: "PUSH_TO_TALK",
    VOICE_ACTIVITY: "VOICE_ACTIVITY",
};

export const VoiceSettingsMode = z.object({
    type: zodCoerceUnhandledValue(VoiceSettingModeTypeObject),
    auto_threshold: z.boolean(),
    threshold: z.number(),
    shortcut: z.array(ShortcutKey),
    delay: z.number(),
});

export const VoiceSettingsIO = z.object({
    device_id: z.string(),
    volume: z.number(),
    available_devices: z.array(VoiceDevice),
});

export const CertifiedDeviceTypeObject = {
    UNHANDLED: -1,
    AUDIO_INPUT: "AUDIO_INPUT",
    AUDIO_OUTPUT: "AUDIO_OUTPUT",
    VIDEO_INPUT: "VIDEO_INPUT",
};

export const CertifiedDevice = z.object({
    type: zodCoerceUnhandledValue(CertifiedDeviceTypeObject),
    id: z.string(),
    vendor: z.object({
        name: z.string(),
        url: z.string(),
    }),
    model: z.object({
        name: z.string(),
        url: z.string(),
    }),
    related: z.array(z.string()),
    echo_cancellation: z.boolean().optional().nullable(),
    noise_suppression: z.boolean().optional().nullable(),
    automatic_gain_control: z.boolean().optional().nullable(),
    hardware_mute: z.boolean().optional().nullable(),
});

export const SkuTypeObject = {
    UNHANDLED: -1,
    APPLICATION: 1,
    DLC: 2,
    CONSUMABLE: 3,
    BUNDLE: 4,
    SUBSCRIPTION: 5,
};

export const Sku = z.object({
    id: z.string(),
    name: z.string(),
    type: zodCoerceUnhandledValue(SkuTypeObject),
    price: z.object({
        amount: z.number(),
        currency: z.string(),
    }),
    application_id: z.string(),
    flags: z.number(),
    release_date: z.string().nullable(),
});

export const EntitlementTypesObject = {
    UNHANDLED: -1,
    PURCHASE: 1,
    PREMIUM_SUBSCRIPTION: 2,
    DEVELOPER_GIFT: 3,
    TEST_MODE_PURCHASE: 4,
    FREE_PURCHASE: 5,
    USER_GIFT: 6,
    PREMIUM_PURCHASE: 7,
};

export const Entitlement = z.object({
    id: z.string(),
    sku_id: z.string(),
    application_id: z.string(),
    user_id: z.string(),
    gift_code_flags: z.number(),
    type: zodCoerceUnhandledValue(EntitlementTypesObject),
    gifter_user_id: z.string().optional().nullable(),
    branches: z.array(z.string()).optional().nullable(),
    starts_at: z.string().optional().nullable(),
    ends_at: z.string().optional().nullable(),
    parent_id: z.string().optional().nullable(),
    consumed: z.boolean().optional().nullable(),
    deleted: z.boolean().optional().nullable(),
    gift_code_batch_id: z.string().optional().nullable(),
});

export const OrientationLockStateTypeObject = {
    UNHANDLED: -1,
    UNLOCKED: 1,
    PORTRAIT: 2,
    LANDSCAPE: 3,
};

export const OrientationLockState = zodCoerceUnhandledValue(
    OrientationLockStateTypeObject
);

export const ThermalStateTypeObject = {
    UNHANDLED: -1,
    NOMINAL: 0,
    FAIR: 1,
    SERIOUS: 2,
    CRITICAL: 3,
};

export const ThermalState = zodCoerceUnhandledValue(ThermalStateTypeObject);

export const OrientationTypeObject = {
    UNHANDLED: -1,
    PORTRAIT: 0,
    LANDSCAPE: 1,
};

export const Orientation = zodCoerceUnhandledValue(OrientationTypeObject);

export const LayoutModeTypeObject = {
    UNHANDLED: -1,
    FOCUSED: 0,
    PIP: 1,
    GRID: 2,
};

export const LayoutMode = zodCoerceUnhandledValue(LayoutModeTypeObject);
