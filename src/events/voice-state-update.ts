import { VoiceState } from "discord.js";
import { checkExitMainVoiceChannel, checkMoveMainVoiceChannel, checkUserMute, checkUserTimeConnection } from "../utils/voice-utils";
import { mainTextChannel } from "../utils/channels-utils";

export = {
    name: 'voiceStateUpdate',
    execute: async (oldState: VoiceState, newState: VoiceState) => {
        const isMainGuild: boolean = [oldState.guild.id, newState.guild.id].includes(mainTextChannel()?.guildId || '');
        const isBot: boolean = oldState.member?.user.bot ?? newState.member?.user.bot ?? false;

        if (!isMainGuild || isBot) {
            return;
        }
        
        await checkMoveMainVoiceChannel(newState);
        await checkUserMute(oldState, newState);
        await checkUserTimeConnection(oldState, newState);
        await checkExitMainVoiceChannel(oldState, newState);
    }
}