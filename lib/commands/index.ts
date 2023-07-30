import { ZodType, z } from "zod";

import { RPCErrorCodes } from "../Constants";
import { Activity, Commands, ReceiveFramePayload } from "../schema/common";
import {
    AuthenticateResponse,
    AuthorizeResponse,
    EmptyResponse,
    EncourageHardwareAccelerationResponse,
    GetChannelPermissionsResponse,
    GetEntitlementsResponse,
    GetPlatformBehaviorsResponse,
    GetSelectedVoiceChannelResponse,
    GetSkusResponse,
    InitiateImageUploadResponse,
    SetActivityResponse,
    SetConfigResponse,
    SetUserVoiceSettingsResponse,
    StartPurchaseResponse,
    UserSettingsGetLocaleResponse,
    VoiceSettingsResponse,
} from "../schema/responses";
import { SendCommandFunction } from "../schema/types";

export const SetActivity = Activity.pick({
    state: true,
    details: true,
    timestamps: true,
    assets: true,
    party: true,
    secrets: true,
    buttons: true,
    instance: true,
    supported_platforms: true,
    type: true,
})
    .extend({
        type: Activity.shape.type.optional(),
        instance: Activity.shape.instance.optional(),
    })
    .nullable();

function makeSendCommand<D extends ZodType>(
    sendCommand: SendCommandFunction,
    cmd: Commands,
    data: D,
    transferTransform: (args: any) => any = args => {}
) {
    const recv = ReceiveFramePayload.extend({
        cmd: z.literal(cmd),
        data,
    });

    return async (args: any) => {
        const le = await sendCommand({
            cmd: cmd,
            args: args,
            transfer: transferTransform(args),
        });
        return recv.parse(le).data;
    };
}

function makeSendCommandWithFallback<R extends ZodType>({
    sendCommand,
    cmd,
    response,
    fallbackTransform,
    transferTransform = () => {},
}: {
    sendCommand: SendCommandFunction;
    cmd: Commands;
    response: R;
    fallbackTransform: (data: any) => any;
    transferTransform?: (args: any) => any;
}) {
    const recv = ReceiveFramePayload.extend({
        cmd: z.literal(cmd),
        data: response,
    });
    return async (data: any) => {
        try {
            const response = await sendCommand({
                cmd: cmd,
                args: data,
                transfer: transferTransform(data),
            });
            return recv.parse(response).data;
        } catch (error) {
            if (error.code === RPCErrorCodes.INVALID_PAYLOAD) {
                const fallbackData = fallbackTransform(data);
                const fallbackResponse = await sendCommand({
                    cmd: cmd,
                    args: fallbackData,
                    transfer: transferTransform(fallbackData),
                });
                return recv.parse(fallbackResponse).data;
            } else throw error;
        }
    };
}

export default function commands(sendCommand: SendCommandFunction) {
    return {
        authenticate: makeSendCommand(
            sendCommand,
            Commands.AUTHENTICATE,
            AuthenticateResponse
        ),
        authorize: makeSendCommand(
            sendCommand,
            Commands.AUTHORIZE,
            AuthorizeResponse
        ),
        captureLog: makeSendCommand(
            sendCommand,
            Commands.CAPTURE_LOG,
            EmptyResponse
        ),
        encourageHardwareAcceleration: makeSendCommand(
            sendCommand,
            Commands.ENCOURAGE_HW_ACCELERATION,
            EncourageHardwareAccelerationResponse
        ),
        getChannelPermissions: makeSendCommand(
            sendCommand,
            Commands.GET_CHANNEL_PERMISSIONS,
            GetChannelPermissionsResponse
        ),
        getEntitlements: makeSendCommand(
            sendCommand,
            Commands.GET_ENTITLEMENTS_EMBEDDED,
            GetEntitlementsResponse
        ),
        getPlatformBehaviors: makeSendCommand(
            sendCommand,
            Commands.GET_PLATFORM_BEHAVIORS,
            GetPlatformBehaviorsResponse
        ),
        getSelectedVoiceChannel: makeSendCommand(
            sendCommand,
            Commands.GET_SELECTED_VOICE_CHANNEL,
            GetSelectedVoiceChannelResponse
        ),
        getSkus: makeSendCommand(
            sendCommand,
            Commands.GET_SKUS_EMBEDDED,
            GetSkusResponse
        ),
        getVoiceSettings: makeSendCommand(
            sendCommand,
            Commands.GET_VOICE_SETTINGS,
            VoiceSettingsResponse
        ),
        openExternalLink: makeSendCommand(
            sendCommand,
            Commands.OPEN_EXTERNAL_LINK,
            EmptyResponse
        ),
        openInviteDialog: makeSendCommand(
            sendCommand,
            Commands.OPEN_INVITE_DIALOG,
            EmptyResponse
        ),
        openShareMomentDialog: makeSendCommand(
            sendCommand,
            Commands.OPEN_SHARE_MOMENT_DIALOG,
            EmptyResponse
        ),
        setActivity: makeSendCommand(
            sendCommand,
            Commands.SET_ACTIVITY,
            SetActivityResponse
        ),
        setConfig: makeSendCommand(
            sendCommand,
            Commands.SET_CONFIG,
            SetConfigResponse
        ),
        setOrientationLockState: makeSendCommandWithFallback({
            sendCommand: sendCommand,
            cmd: Commands.SET_ORIENTATION_LOCK_STATE,
            response: EmptyResponse,
            fallbackTransform: data => ({
                lock_state: data.lock_state,
                picture_in_picture_lock_state:
                    data.picture_in_picture_lock_state,
            }),
        }),
        setUserVoiceSettings: makeSendCommand(
            sendCommand,
            Commands.SET_USER_VOICE_SETTINGS,
            SetUserVoiceSettingsResponse
        ),
        startPremiumPurchase: makeSendCommand(
            sendCommand,
            Commands.START_PREMIUM_PURCHASE,
            EmptyResponse
        ),
        startPurchase: makeSendCommand(
            sendCommand,
            Commands.START_PURCHASE,
            StartPurchaseResponse
        ),
        userSettingsGetLocale: makeSendCommand(
            sendCommand,
            Commands.USER_SETTINGS_GET_LOCALE,
            UserSettingsGetLocaleResponse
        ),
        initiateImageUpload: makeSendCommand(
            sendCommand,
            Commands.INITIATE_IMAGE_UPLOAD,
            InitiateImageUploadResponse
        ),
    };
}
