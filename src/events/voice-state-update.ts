import { VoiceState } from "discord.js";
import { config } from "../config/get-configs";

export = {
    name: 'voiceStateUpdate',
    execute: async (oldState: VoiceState, newState: VoiceState) => {
        // // Connect main channel
        // if(oldState.channelId === null && newState.channelId === config().channels.voiceHorarios) {
        //     await oldState.member?.roles.add(config().cargos.horarios);
        // }
        // // Disconect main channel
        // if (newState.channelId === null && oldState.channelId === config().channels.voiceHorarios) {
        //     await newState.member?.roles.remove(config().cargos.horarios);
        // }
        // // Move from main channel to other channel
        // if(oldState.channelId === config().channels.voiceHorarios && newState.channelId !== config().channels.voiceHorarios) {
        //     await newState.member?.roles.remove(config().cargos.horarios);
        // }
        // // Move from other channel to main channel
        // if(oldState.channelId !== config().channels.voiceHorarios && newState.channelId === config().channels.voiceHorarios) {
        //     await oldState.member?.roles.add(config().cargos.horarios);
        // }
        // If mute audio on main channel, move to afk channel
        if (!newState.member?.roles.cache.has(config().cargos.headset) && newState.selfDeaf && newState.channelId === config().channels.voiceHorarios) {
            await newState.member?.voice.setChannel(config().channels.voiceAfk);
        }
        // If unmute audio on afk channel, move to main channel
        if (!newState.member?.roles.cache.has(config().cargos.headset) && oldState.channelId === config().channels.voiceAfk && !newState.selfDeaf && newState.channelId === config().channels.voiceAfk) {
            await newState.member?.voice.setChannel(config().channels.voiceHorarios);
        }
    }
}