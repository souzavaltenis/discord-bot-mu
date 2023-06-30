import { VoiceState } from "discord.js";
import { checkUserMute, checkUserTimeConnection } from "../utils/voice-utils";

export = {
    name: 'voiceStateUpdate',
    execute: async (oldState: VoiceState, newState: VoiceState) => {
        await checkUserMute(oldState, newState);
        await checkUserTimeConnection(oldState, newState);
    }
}