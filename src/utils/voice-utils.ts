import { GuildMember, VoiceState, codeBlock } from "discord.js";
import { config } from "../config/get-configs";
import { adicionarTempoUsuario } from "../db/db";
import { InfoMember } from "../models/info-member";
import { geralSingleton } from "../models/singleton/geral-singleton";
import { logInOutTextChannel } from "./channels-utils";
import { dataNowString, formatTimestamp } from "./data-utils";
import { getNickGuildMember } from "./geral-utils";

async function checkUserMute(oldState: VoiceState, newState: VoiceState): Promise<void> {
    // No action if member has headset role or not exists member/channel on newState
    if (newState.member?.roles.cache.has(config().cargos.headset) || !newState.member || !newState.channelId) {
        return;
    }

    const isMuted: boolean = newState.selfDeaf || newState.selfDeaf || false;
    const isNewChannelAfk: boolean = newState.channelId === config().channels.voiceAfk;
    const isOldChannelAfk: boolean = oldState.channelId === config().channels.voiceAfk;

    // Move member to afk voice channel if mute audio
    if (isMuted && !isNewChannelAfk) {
        await newState.member?.voice.setChannel(config().channels.voiceAfk);
    }

    // Move member to horarios voice channel if unmute audio
    if (!isMuted && isOldChannelAfk) {
        await newState.member?.voice.setChannel(config().channels.voiceHorarios);
    }
}

async function checkUserTimeConnection(oldState: VoiceState, newState: VoiceState): Promise<void> {
    const idUser: string = oldState.member?.id || newState.member?.id || '';
    const nickUser: string = getNickGuildMember(oldState.member) || getNickGuildMember(newState.member);
    
    const isExit: boolean = 
        (Boolean(oldState.channel) && Boolean(oldState.channelId)) &&
        (!newState.channelId || (Boolean(newState.channelId) && newState.channelId !== oldState.channelId));
    
    const isEnter: boolean = Boolean(newState.channel) && Boolean(newState.channelId);
    
    const timestampNow: number = new Date().valueOf();
    const timestampNowStr: string = dataNowString('HH:mm:ss');

    let infoMember: InfoMember | undefined = geralSingleton.infoMember.get(idUser);

    if (infoMember === undefined) {
        infoMember = new InfoMember(idUser, nickUser, 0, 0);
    }

    if (isExit) {
        const totalTimeConnection: number = infoMember.lastConnect > 0 ? timestampNow - infoMember.lastConnect : 0;

        if (infoMember.lastConnect !== 0) {
            infoMember.timeOnline = timestampNow - infoMember.lastConnect;
            infoMember.lastConnect = 0;

            await adicionarTempoUsuario(infoMember);
        }

        let messageExit: string = `[${timestampNowStr}]: ${nickUser} saiu de ${oldState.channel?.name} (${oldState.channel?.id ?? ''}) <${oldState.guild.name}>`;
        
        if (totalTimeConnection > 1000) {
            messageExit += ` (Ficou ${formatTimestamp(totalTimeConnection)})`;
        }

        await logInOutTextChannel()?.send({
            content: codeBlock(messageExit)
        });
    }

    if (isEnter) {
        if (newState.channelId !== config().channels.voiceAfk) {
            infoMember.timeOnline = 0;
            infoMember.lastConnect = timestampNow;
        }
        
        const messageEnter: string = `[${timestampNowStr}]: ${nickUser} entrou em ${newState.channel?.name} (${newState.channel?.id ?? ''}) <${newState.guild.name}>`;

        await logInOutTextChannel()?.send({
            content: codeBlock(messageEnter)
        });
    }

    geralSingleton.infoMember.set(idUser, infoMember);
}

async function checkMoveMainVoiceChannel(newState: VoiceState): Promise<void> {
    const isEntryMainChannel: boolean = newState.channelId === config().channels.voiceEntryMain;
    const member: GuildMember | null = newState.member;

    if (!isEntryMainChannel || !member) {
        return;
    }

    const hasMainChannelRole: boolean = member.roles.cache.has(config().cargos.mainChannel);

    if (!hasMainChannelRole) {
        await member.roles.add(config().cargos.mainChannel);
    }

    await member.voice.setChannel(config().channels.voiceHorarios);
}

async function checkExitMainVoiceChannel(oldState: VoiceState, newState: VoiceState): Promise<void> {
    const isExitMainVoiceChannel = oldState.channelId === config().channels.voiceHorarios && newState.channelId !== config().channels.voiceHorarios;
    const member: GuildMember | null = oldState.member;

    if (!isExitMainVoiceChannel || !member) {
        return;
    }

    const hasMainChannelRole: boolean = member.roles.cache.has(config().cargos.mainChannel);

    if (hasMainChannelRole) {
        await member.roles.remove(config().cargos.mainChannel);
    }
}

export {
    checkUserMute,
    checkUserTimeConnection,
    checkMoveMainVoiceChannel,
    checkExitMainVoiceChannel
}