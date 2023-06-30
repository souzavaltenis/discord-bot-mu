import { VoiceState, codeBlock } from "discord.js";
import { config } from "../config/get-configs";
import { adicionarTempoUsuario } from "../db/db";
import { InfoMember } from "../models/info-member";
import { geralSingleton } from "../models/singleton/geral-singleton";
import { mainTextChannel, logInOutTextChannel } from "./channels-utils";
import { dataNowString, formatTimestamp } from "./data-utils";
import { getNickGuildMember } from "./geral-utils";

async function checkUserMute(oldState: VoiceState, newState: VoiceState): Promise<void> {
    // No action if member has headset role
    if (newState.member?.roles.cache.has(config().cargos.headset)) {
        return;
    }

    // If mute audio on main channel, move to afk channel
    if (newState.selfDeaf && newState.channelId === config().channels.voiceHorarios) {
        await newState.member?.voice.setChannel(config().channels.voiceAfk);
    }
    
    // If unmute audio on afk channel, move to main channel
    if (oldState.channelId === config().channels.voiceAfk && !newState.selfDeaf && newState.channelId === config().channels.voiceAfk) {
        await newState.member?.voice.setChannel(config().channels.voiceHorarios);
    }
}

async function checkUserTimeConnection(oldState: VoiceState, newState: VoiceState): Promise<void> {
    const isMainGuild: boolean = [oldState.guild.id, newState.guild.id].includes(mainTextChannel()?.guildId || '');
    const isBot: boolean = oldState.member?.user.bot ?? newState.member?.user.bot ?? false;

    if (!isMainGuild || isBot) {
        return;
    }

    const idUser: string = oldState.member?.id || newState.member?.id || '';
    const nickUser: string = getNickGuildMember(oldState.member) || getNickGuildMember(newState.member);
    const isExit: boolean = oldState.channelId !== null && (newState.channelId === null || (newState.channelId !== null && newState.channelId !== oldState.channelId));
    const isEnter: boolean = newState.channelId !== null;
    const timestampNow: number = new Date().valueOf();
    const timestampNowStr: string = dataNowString('HH:mm:ss');

    let infoMember: InfoMember | undefined = geralSingleton.infoMember.get(idUser);

    if (infoMember === undefined) {
        infoMember = new InfoMember(idUser, nickUser, 0, 0, 0);
    }

    if (isExit) {
        const totalTimeConnection: number = infoMember.connectSince > 0 ? timestampNow - infoMember.connectSince : 0;

        if (infoMember.lastConnect !== 0) {
            infoMember.timeOnline = timestampNow - infoMember.lastConnect;
            infoMember.lastConnect = 0;
            infoMember.connectSince = 0;

            await adicionarTempoUsuario(infoMember);
        }

        let messageExit: string = `[${timestampNowStr}]: ${nickUser} saiu de ${oldState.channel?.name} <${oldState.guild.name}>`;
        
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
            infoMember.connectSince = timestampNow;
        }
        
        const messageEnter: string = `[${timestampNowStr}]: ${nickUser} entrou em ${newState.channel?.name} <${newState.guild.name}>`;

        await logInOutTextChannel()?.send({
            content: codeBlock(messageEnter)
        });
    }

    geralSingleton.infoMember.set(idUser, infoMember);
}

export {
    checkUserMute,
    checkUserTimeConnection
}