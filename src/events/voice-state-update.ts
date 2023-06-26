import { VoiceState, codeBlock } from "discord.js";
import { config } from "../config/get-configs";
import { dataNowString, formatTimestamp } from "../utils/data-utils";
import { geralSingleton } from "../models/singleton/geral-singleton";
import { InfoMember } from "../models/info-member";
import { adicionarTempoUsuario } from "../db/db";
import { logInOutTextChannel, mainTextChannel } from "../utils/channels-utils";
import { getNickGuildMember } from "../utils/geral-utils";

export = {
    name: 'voiceStateUpdate',
    execute: async (oldState: VoiceState, newState: VoiceState) => {
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
            infoMember = new InfoMember(idUser, nickUser, 0, 0);
        }

        if (isExit) {
            if (infoMember.lastConnect !== 0) {
                infoMember.timeOnline = timestampNow - infoMember.lastConnect;
                infoMember.lastConnect = 0;
    
                await adicionarTempoUsuario(infoMember);
            }

            let messageExit: string = `[${timestampNowStr}]: ${nickUser} saiu de ${oldState.channel?.name} <${oldState.guild.name}>`;
            
            if (infoMember.timeOnline > 1000) {
                messageExit += ` (Ficou ${formatTimestamp(infoMember.timeOnline)})`;
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
            
            const messageEnter: string = `[${timestampNowStr}]: ${nickUser} entrou em ${newState.channel?.name} <${oldState.guild.name}>`;

            await logInOutTextChannel()?.send({
                content: codeBlock(messageEnter)
            });
        }

        geralSingleton.infoMember.set(idUser, infoMember);
    }
}