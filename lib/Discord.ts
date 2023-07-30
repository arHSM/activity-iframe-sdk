import bigInt from "big-integer";
import EventEmmiter from "events";
import { transform } from "lodash";
import { v4 } from "uuid";

import * as Constants from "./Constants";
import commands from "./commands/index";
import { SDKError } from "./error";
import { ClosePayload, parseIncomingPayload } from "./schema";
import { Commands, LayoutModeTypeObject } from "./schema/common";
import { ERROR } from "./schema/events";
import {
    ActivityLayoutModeUpdateType,
    ActivityPIPModeUpdateType,
    ClosePayloadType,
    ErrorEventFrameType,
    EventTypeMap,
    IncomingPayloadType,
} from "./schema/types";

const SUBSTITUTION_REGEX = /\{([a-z]+)\}/g;

function regexFromTarget(target: string) {
    const regexString = target.replace(
        SUBSTITUTION_REGEX,
        (match, name) => `(?<${name}>[\\w-]+)`
    );

    return new RegExp(`${regexString}(/|$)`);
}

function matchAndRewriteURL({
    originalURL,
    prefix,
    prefixHost,
    target,
}: {
    originalURL: URL;
    prefix: string;
    prefixHost: string;
    target: string;
}) {
    const targetURL = new URL(`https://${target}`);
    const targetRegEx = regexFromTarget(targetURL.host);
    const match = originalURL.toString().match(targetRegEx);

    if (match == null) return originalURL;

    const newURL = new URL(originalURL.toString());

    newURL.host = prefixHost;
    newURL.pathname = prefix.replace(SUBSTITUTION_REGEX, (_, matchName) => {
        var _a;
        const replaceValue =
            (_a = match.groups) === null || _a === void 0
                ? void 0
                : _a[matchName];

        if (replaceValue == null) throw new Error("Misconfigured route.");
        return replaceValue;
    });

    newURL.pathname +=
        newURL.pathname === "/"
            ? originalURL.pathname.slice(1)
            : originalURL.pathname;
    newURL.pathname = newURL.pathname.replace(targetURL.pathname, "");
    newURL.pathname += newURL.pathname.endsWith("/") ? "" : "/";

    return newURL;
}

function absoluteURL(
    url: string | URL,
    protocol = window.location.protocol,
    host = window.location.host
) {
    if (url instanceof URL) {
        return url;
    }

    return url.startsWith("/")
        ? new URL(`${protocol}//${host}${url}`)
        : new URL(url);
}

function attemptRemap({
    url,
    mappings,
}: {
    url: URL;
    mappings: { prefix: string; target: string }[];
}) {
    for (const mapping of mappings) {
        const mapped = matchAndRewriteURL({
            originalURL: url,
            prefix: mapping.prefix,
            target: mapping.target,
            prefixHost: window.location.host,
        });

        if (mapped) return mapped;
    }

    return url;
}

function initializeNetworkShims(
    _applicationId: string,
    mappings: { prefix: string; target: string }[]
) {
    const fetchImpl = window.fetch;
    window.fetch = function (input, init) {
        const ie = attemptRemap({
            url: absoluteURL(input.toString()),
            mappings: mappings,
        });
        return fetchImpl(ie.toString(), init);
    };

    const openImpl = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (
        method,
        url,
        async?,
        username?,
        password?
    ) {
        const remapped = attemptRemap({
            url: absoluteURL(url),
            mappings: mappings,
        });
        openImpl.apply(this, [
            method,
            remapped.toString(),
            async,
            username,
            password,
        ]);
    };

    class WebSocketProxy extends WebSocket {
        constructor(urlIn: string | URL, protocols?: string | string[]) {
            const url = urlIn instanceof URL ? urlIn.toString() : urlIn;
            const remapped = attemptRemap({
                url: absoluteURL(url, "wss:"),
                mappings: mappings,
            });
            super(remapped.toString(), protocols);
        }
    }
    window.WebSocket = WebSocketProxy;
}
function getDefaultSdkConfiguration() {
    return {
        disableConsoleLogOverride: false,
    };
}

const consoleLevels: (keyof Console)[] = [
    "log",
    "warn",
    "debug",
    "info",
    "error",
];
function wrapConsoleMethod(
    console: Console,
    level: keyof Console,
    callback: (...args: any[]) => void
) {
    const _consoleMethod = console[level];
    const _console = console;

    if (!_consoleMethod) return;

    console[level] = function () {
        const args = [].slice.call(arguments);
        const message = "" + args.join(" ");
        callback(level, message);
        _consoleMethod.apply(_console, args);
    };
}

export enum Opcodes {
    HANDSHAKE = 0,
    FRAME = 1,
    CLOSE = 2,
    HELLO = 3,
}

const ALLOWED_ORIGINS = new Set([
    window.location.origin,
    "https://discord.com",
    "https://discordapp.com",
    "https://ptb.discord.com",
    "https://ptb.discordapp.com",
    "https://canary.discord.com",
    "https://canary.discordapp.com",
    "https://staging.discord.co",
    "http://localhost:3333",
    "https://pax.discord.com",
    "null",
]);

function getRPCServerSource() {
    var _a;
    return [
        (_a = window.parent.opener) !== null && _a !== void 0
            ? _a
            : window.parent,
        document.referrer ? document.referrer : "*",
    ];
}

export class DiscordSDK {
    eventBus: EventEmmiter;
    source: Window;
    sourceOrigin: string;
    pendingCommands: Map<
        string,
        { resolve: (value: unknown) => void; reject: (reason?: any) => void }
    >;
    layoutModeUpdateListenerMap: Map<
        (update: ActivityLayoutModeUpdateType) => void,
        {
            layoutModeListener: (update: ActivityLayoutModeUpdateType) => void;
            pipModeListener: (update: ActivityPIPModeUpdateType) => void;
        }
    >;
    sendCommand: <P extends IncomingPayloadType>(
        payload: P
    ) => Promise<unknown>;
    commands: ReturnType<typeof commands>;
    initializeNetworkShims: typeof initializeNetworkShims;
    handleMessage: (
        event: MessageEvent<
            | [Opcodes.HELLO, any]
            | [Opcodes.CLOSE, ClosePayloadType]
            | [Opcodes.HANDSHAKE, any]
            | [Opcodes.FRAME, IncomingPayloadType]
        >
    ) => void;
    isReady: boolean;
    clientId: string;
    frameId: string;
    instanceId: string;
    platform: string;
    guildId: string;
    channelId: string;
    configuration: Record<string, any>;

    constructor(clientId: string, configuration: Record<string, any>) {
        this.eventBus = new EventEmmiter();
        this.source = null;
        this.sourceOrigin = "";
        this.pendingCommands = new Map();
        this.layoutModeUpdateListenerMap = new Map();
        this.sendCommand = payload => {
            var _a;

            if (this.source == null) {
                throw new Error(
                    "Attempting to send message before initialization"
                );
            }

            const nonce = v4();

            (_a = this.source) === null ||
                _a === void 0 ||
                _a.postMessage(
                    [
                        Opcodes.FRAME,
                        Object.assign(Object.assign({}, payload), {
                            nonce: nonce,
                        }),
                    ],
                    this.sourceOrigin,
                    this.getTransfer(payload)
                );

            return new Promise((resolve, reject) => {
                this.pendingCommands.set(nonce, {
                    resolve,
                    reject,
                });
            });
        };
        this.commands = commands(this.sendCommand);
        this.initializeNetworkShims = initializeNetworkShims;
        this.handleMessage = event => {
            if (!ALLOWED_ORIGINS.has(event.origin)) return;

            const tuple = event.data;
            if (!Array.isArray(tuple)) return;

            const [opcode, data] = tuple;
            switch (opcode) {
                case Opcodes.HELLO:
                    return;
                case Opcodes.CLOSE:
                    return this.handleClose(data);
                case Opcodes.HANDSHAKE:
                    return this.handleHandshake();
                case Opcodes.FRAME:
                    return this.handleFrame(data);
                default:
                    throw new Error("Invalid message format");
            }
        };
        this.isReady = false;
        this.clientId = clientId;
        this.configuration =
            configuration != null
                ? configuration
                : getDefaultSdkConfiguration();

        window.addEventListener("message", this.handleMessage);

        const urlParams = new URLSearchParams(window.location.search);
        const frameId = urlParams.get("frame_id");

        if (!frameId) throw new Error("frame_id query param is not defined");
        this.frameId = frameId;

        const instanceId = urlParams.get("instance_id");

        if (!instanceId)
            throw new Error("instance_id query param is not defined");
        this.instanceId = instanceId;

        const platform = urlParams.get("platform");
        if (platform) {
            if (
                platform !== Constants.Platform.DESKTOP &&
                platform !== Constants.Platform.MOBILE
            )
                throw new Error(
                    `Invalid query param "platform" of "${platform}". Valid values are "${Constants.Platform.DESKTOP}" or "${Constants.Platform.MOBILE}"`
                );
        } else throw new Error("platform query param is not defined");

        this.platform = platform;
        this.guildId = urlParams.get("guild_id");
        this.channelId = urlParams.get("channel_id");
        [this.source, this.sourceOrigin] = getRPCServerSource();

        this.addOnReadyListener();
        this.handshake();
    }

    getTransfer(payload: IncomingPayloadType): undefined | any[] {
        var _a;

        switch (payload.cmd) {
            case Commands.SUBSCRIBE:
            case Commands.UNSUBSCRIBE:
                return;
            default:
                return (_a = payload.transfer) !== null && _a !== void 0
                    ? (_a as any[])
                    : void 0;
        }
    }

    close(code: number, message: string) {
        var _a;

        window.removeEventListener("message", this.handleMessage);

        const nonce = v4();

        (_a = this.source) === null ||
            _a === void 0 ||
            _a.postMessage(
                [
                    Opcodes.CLOSE,
                    {
                        code: code,
                        message: message,
                        nonce: nonce,
                    },
                ],
                this.sourceOrigin
            );
    }

    async subscribe<E extends Constants.Events>(
        event: E,
        listener: (payload: EventTypeMap[E]) => void,
        subscribeArgs?: any
    ) {
        const listenerCount = this.eventBus.listenerCount(event);
        const emitter = this.eventBus.on(event, listener);

        if (
            Object.values(Constants.Events).includes(event) &&
            event !== Constants.Events.READY &&
            listenerCount === 0
        ) {
            await this.sendCommand({
                cmd: Commands.SUBSCRIBE,
                args: subscribeArgs,
                evt: event,
            });
        }

        return emitter;
    }

    async unsubscribe<E extends Constants.Events>(
        event: E,
        listener: (payload: EventTypeMap[E]) => void
    ) {
        if (
            Object.values(Constants.Events).includes(event) &&
            event !== Constants.Events.READY &&
            this.eventBus.listenerCount(event) === 1
        ) {
            await this.sendCommand({
                cmd: Commands.UNSUBSCRIBE,
                evt: event,
            });
        }

        return this.eventBus.off(event, listener);
    }

    async ready() {
        if (this.isReady) {
            return;
        } else {
            await new Promise(resolve => {
                this.eventBus.once(Constants.Events.READY, resolve);
            });
        }
    }

    async subscribeToLayoutModeUpdatesCompat(
        listener: (update: ActivityLayoutModeUpdateType) => void
    ) {
        const pipModeListener = (update: ActivityPIPModeUpdateType) => {
            const layoutMode = update.is_pip_mode
                ? LayoutModeTypeObject.PIP
                : LayoutModeTypeObject.FOCUSED;
            listener({
                layout_mode: layoutMode,
            });
        };

        const pipModeSubscription = await this.subscribe(
            Constants.Events.ACTIVITY_PIP_MODE_UPDATE,
            pipModeListener
        );

        const layoutModeListener = (update: ActivityLayoutModeUpdateType) => {
            this.unsubscribe(
                Constants.Events.ACTIVITY_PIP_MODE_UPDATE,
                pipModeListener
            );
            listener(update);
        };

        this.layoutModeUpdateListenerMap.set(listener, {
            layoutModeListener,
            pipModeListener,
        });

        try {
            return await this.subscribe(
                Constants.Events.ACTIVITY_LAYOUT_MODE_UPDATE,
                layoutModeListener
            );
        } catch (error) {
            if (error.code === Constants.RPCErrorCodes.INVALID_EVENT)
                return pipModeSubscription;
            throw error;
        }
    }

    async unsubscribeFromLayoutModeUpdatesCompat(
        listener: (update: ActivityLayoutModeUpdateType) => void
    ) {
        const listeners = this.layoutModeUpdateListenerMap.get(listener);
        this.layoutModeUpdateListenerMap.delete(listener);

        if (listeners != null) {
            const { layoutModeListener, pipModeListener } = listeners;

            let layoutModeUnsubscribeResult = null;
            let pipModeUnsubscribeResult = null;

            if (layoutModeListener != null) {
                try {
                    layoutModeUnsubscribeResult = await this.unsubscribe(
                        Constants.Events.ACTIVITY_LAYOUT_MODE_UPDATE,
                        layoutModeListener
                    );
                } catch (error) {
                    if (error.code !== Constants.RPCErrorCodes.INVALID_EVENT)
                        throw error;
                }
            }

            if (pipModeListener != null) {
                pipModeUnsubscribeResult = await this.unsubscribe(
                    Constants.Events.ACTIVITY_PIP_MODE_UPDATE,
                    pipModeListener
                );
            }

            return layoutModeUnsubscribeResult != null
                ? layoutModeUnsubscribeResult
                : pipModeUnsubscribeResult;
        }
    }

    handshake() {
        var _a;
        (_a = this.source) === null ||
            _a === void 0 ||
            _a.postMessage(
                [
                    Opcodes.HANDSHAKE,
                    {
                        v: 1,
                        encoding: "json",
                        client_id: this.clientId,
                        frame_id: this.frameId,
                    },
                ],
                this.sourceOrigin
            );
    }

    addOnReadyListener() {
        this.eventBus.once(Constants.Events.READY, () => {
            this.overrideConsoleLogging();
            this.isReady = true;
        });
    }

    overrideConsoleLogging() {
        if (this.configuration.disableConsoleLogOverride) return;

        const sendCaptureLogCommand = (
            level: typeof consoleLevels,
            message: string
        ) => {
            this.commands.captureLog({
                level,
                message,
            });
        };

        consoleLevels.forEach(level => {
            wrapConsoleMethod(console, level, sendCaptureLogCommand);
        });
    }

    handleClose(data: ClosePayloadType) {
        ClosePayload.parse(data);
    }

    handleHandshake() {}

    handleFrame(data: IncomingPayloadType) {
        var _a, _b;

        let parsed: ReturnType<typeof parseIncomingPayload>;
        try {
            parsed = parseIncomingPayload(data);
        } catch (e) {
            console.error("Failed to parse", data);
            console.error(e);
            return;
        }

        if (parsed.cmd === "DISPATCH") {
            this.eventBus.emit(parsed.evt, parsed.data);
        } else {
            if (
                ((parsed): parsed is ErrorEventFrameType =>
                    parsed.evt === ERROR)(parsed)
            ) {
                if (parsed.nonce != null) {
                    (_a = this.pendingCommands.get(parsed.nonce)) === null ||
                        _a === void 0 ||
                        _a.reject(parsed.data),
                        this.pendingCommands.delete(parsed.nonce);
                    return;
                }

                this.eventBus.emit(
                    "error",
                    new SDKError(parsed.data.code, parsed.data.message)
                );
            }

            if (parsed.nonce == null) {
                console.error("Missing nonce", data);
                return;
            }

            (_b = this.pendingCommands.get(parsed.nonce)) === null ||
                _b === void 0 ||
                _b.resolve(parsed);
            this.pendingCommands.delete(parsed.nonce);
        }
    }
}

export class DiscordSDKMock {
    platform: string;
    instanceId: string;
    configuration: Record<string, any>;
    frameId: string;
    eventBus: EventEmmiter;
    clientId: string;
    commands: typeof commandsMockDefault;
    guildId: string;
    channelId: string;

    constructor(clientId: string, guildId: string, channelId: string) {
        this.platform = Constants.Platform.DESKTOP;
        this.instanceId = "123456789012345678";
        this.configuration = getDefaultSdkConfiguration();
        this.frameId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
        this.eventBus = new EventEmmiter();
        this.clientId = clientId;
        this.commands = this._updateCommandMocks({});
        this.guildId = guildId;
        this.channelId = channelId;
    }

    _updateCommandMocks(newCommands: Partial<typeof commandsMockDefault>) {
        this.commands = transform(
            Object.assign({}, commandsMockDefault, newCommands),
            (mock, func, name: keyof typeof commandsMockDefault) => {
                mock[name] = async (...args: any[]) => {
                    console.info(
                        `DiscordSDKMock: ${String(name)}(${JSON.stringify(
                            args
                        )})`
                    );
                    // @ts-ignore
                    return await func(...args);
                };
            }
        );

        return this.commands;
    }

    emitReady() {
        this.emitEvent(Constants.Events.READY, void 0);
    }

    close(...args: any[]) {
        console.info(`DiscordSDKMock: close(${JSON.stringify(args)})`);
    }

    ready() {
        return Promise.resolve();
    }

    async subscribe<E extends Constants.Events>(
        event: E,
        listener: (payload: EventTypeMap[E]) => void
    ) {
        return this.eventBus.on(event, listener);
    }

    async unsubscribe<E extends Constants.Events>(
        event: E,
        listener: (payload: EventTypeMap[E]) => void
    ) {
        return this.eventBus.off(event, listener);
    }

    async subscribeToLayoutModeUpdatesCompat(
        listener: (update: ActivityLayoutModeUpdateType) => void
    ) {
        return this.eventBus.on(
            Constants.Events.ACTIVITY_LAYOUT_MODE_UPDATE,
            listener
        );
    }

    async unsubscribeFromLayoutModeUpdatesCompat(
        listener: (update: ActivityLayoutModeUpdateType) => void
    ) {
        return this.eventBus.off(
            Constants.Events.ACTIVITY_LAYOUT_MODE_UPDATE,
            listener
        );
    }

    initializeNetworkShims(
        applicationId: string,
        mappings: { prefix: string; target: string }[]
    ) {
        console.info(
            "Mock initializing network shims",
            applicationId,
            mappings
        );
    }

    emitEvent<E extends Constants.Events>(
        event: E,
        data: EventTypeMap[E]["data"]
    ) {
        this.eventBus.emit(event, data);
    }
}

const commandsMockDefault = {
    authorize: () =>
        Promise.resolve({
            code: "mock_code",
        }),
    authenticate: () =>
        Promise.resolve({
            access_token: "mock_token",
            user: {
                username: "mock_user_username",
                discriminator: "mock_user_discriminator",
                id: "mock_user_id",
                avatar: null,
                public_flags: 1,
            },
            scopes: [],
            expires: new Date(2121, 1, 1).toString(),
            application: {
                description: "mock_app_description",
                icon: "mock_app_icon",
                id: "mock_app_id",
                name: "mock_app_name",
            },
        }),
    setActivity: () =>
        Promise.resolve({
            name: "mock_activity_name",
            type: 0,
        }),
    getSkus: () =>
        Promise.resolve({
            skus: [],
        }),
    getEntitlements: () =>
        Promise.resolve({
            entitlements: [],
        }),
    startPurchase: () => Promise.resolve([]),
    startPremiumPurchase: () => Promise.resolve(null),
    setConfig: () =>
        Promise.resolve({
            use_interactive_pip: false,
        }),
    getSelectedVoiceChannel: () => Promise.resolve(null),
    userSettingsGetLocale: () =>
        Promise.resolve({
            locale: "",
        }),
    getVoiceSettings: () =>
        Promise.resolve({
            input: {
                device_id: "default",
                volume: 0,
                available_devices: [
                    {
                        id: "default",
                        name: "default",
                    },
                ],
            },
            output: {
                device_id: "default",
                volume: 0,
                available_devices: [
                    {
                        id: "default",
                        name: "default",
                    },
                ],
            },
            mode: {
                type: "VOICE_ACTIVITY",
                auto_threshold: false,
                threshold: 0,
                shortcut: [],
                delay: 0,
            },
            automatic_gain_control: false,
            echo_cancellation: false,
            noise_suppression: false,
            qos: false,
            silence_warning: false,
            deaf: false,
            mute: false,
        }),
    setUserVoiceSettings: () =>
        Promise.resolve({
            user_id: "user_id",
            mute: false,
            pan: {
                left: 1,
                right: 1,
            },
            volume: 100,
        }),
    openExternalLink: () => Promise.resolve(null),
    encourageHardwareAcceleration: () =>
        Promise.resolve({
            enabled: true,
        }),
    captureLog: () => Promise.resolve(null),
    setOrientationLockState: () => Promise.resolve(null),
    openInviteDialog: () => Promise.resolve(null),
    getPlatformBehaviors: () =>
        Promise.resolve({
            iosKeyboardResizesView: true,
        }),
    getChannelPermissions: () =>
        Promise.resolve({
            permissions: bigInt(1234567890),
        }),
    openShareMomentDialog: () => Promise.resolve(null),
    initiateImageUpload: () =>
        Promise.resolve({
            image_url:
                "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0b52aa9e99b832574a53_full_logo_blurple_RGB.png",
        }),
};
