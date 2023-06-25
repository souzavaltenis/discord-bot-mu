import { VoiceState, channelMention } from "discord.js";
import { config } from "../config/get-configs";
import { dataNowString, formatTimestamp } from "../utils/data-utils";
import { geralSingleton } from "../models/singleton/geral-singleton";
import { InfoMember } from "../models/info-member";
import { adicionarTempoUsuario } from "../db/db";
import { logInOutTextChannel, mainTextChannel } from "../utils/channels-utils";

export = {
    name: 'voiceStateUpdate',
    execute: async (oldState: VoiceState, newState: VoiceState) => {
        const isMainGuild: boolean = [oldState.guild.id, newState.guild.id].includes(mainTextChannel()?.guildId || '');
        const isBot: boolean = oldState.member?.user.bot ?? newState.member?.user.bot ?? false;

        if (!isMainGuild || isBot) {
            return;
        }

        const idUser: string = oldState.member?.id || newState.member?.id || '';
        const isExit: boolean = oldState.channelId !== null && (newState.channelId === null || (newState.channelId !== null && newState.channelId !== oldState.channelId));
        const isEnter: boolean = newState.channelId !== null;
        const timestampNow: number = new Date().valueOf();
        const timestampNowStr: string = dataNowString('HH:mm:ss');

        let infoMember: InfoMember | undefined = geralSingleton.infoMember.get(idUser);

        if (infoMember === undefined) {
            infoMember = new InfoMember(idUser, 0, 0);
        }

        if (isExit) {
            if (infoMember.lastConnect !== 0) {
                infoMember.timeOnline = timestampNow - infoMember.lastConnect;
                infoMember.lastConnect = 0;
    
                await adicionarTempoUsuario(infoMember);
            }

            let messageExit: string = `[${timestampNowStr}]: ${oldState.member?.displayName} saiu de ${channelMention(oldState.channelId || '')}`;
            
            if (infoMember.timeOnline) {
                messageExit += ` (Ficou ${formatTimestamp(infoMember.timeOnline)})`;
            }

            await logInOutTextChannel()?.send({ content: messageExit });
        }

        if (isEnter) {
            if (newState.channelId !== config().channels.voiceAfk) {
                infoMember.timeOnline = 0;
                infoMember.lastConnect = timestampNow;
            }

            await logInOutTextChannel()?.send({ content: `[${timestampNowStr}]: ${newState.member?.displayName} entrou em ${channelMention(newState.channelId || '')}` });
        }

        geralSingleton.infoMember.set(idUser, infoMember);
    }
}