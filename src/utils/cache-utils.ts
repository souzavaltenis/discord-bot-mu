import { User } from "discord.js";
import { InfoMember } from "../models/info-member";
import { ITimeOnlineInfo } from "../models/interface/time-online-info";
import { usuariosSingleton } from "../models/singleton/usuarios-singleton";
import { stringToMoment } from "./data-utils";
import { INickInfo } from "../models/interface/nick-info";

function atualizarCacheTempoOnlineUsuario(keyDataAtual: string, infoMember: InfoMember): void {
    if (usuariosSingleton.usuarios.length === 0) {
        return;
    }

    const indexUsuario: number = usuariosSingleton.usuarios.findIndex(u => u.id === infoMember.id);

    const infoTimeOnlineInicial: ITimeOnlineInfo = {
        timestampDay: stringToMoment(keyDataAtual + '00:00 -03:00').valueOf(),
        timestampOnline: infoMember.timeOnline,
        isOld: false
    };

    // Usuário novo
    if (indexUsuario === -1) {
        const timeOnline: Map<string, ITimeOnlineInfo> = new Map<string, ITimeOnlineInfo>();
        timeOnline.set(keyDataAtual, infoTimeOnlineInicial);

        usuariosSingleton.usuarios.push({
            id: infoMember.id,
            name: infoMember.nick,
            timestampsAnotacoes: [],
            totalTimeOnline: infoMember.timeOnline,
            nicks: [],
            timeOnline: timeOnline
        });
    }
    
    // Usuário existente
    if (indexUsuario > -1) {
        usuariosSingleton.usuarios[indexUsuario].totalTimeOnline += infoMember.timeOnline;
        
        let timeOnlineAtual: ITimeOnlineInfo | undefined = usuariosSingleton.usuarios[indexUsuario].timeOnline.get(keyDataAtual);

        if (timeOnlineAtual) { // Se existir timeOnline para o dia atual, apenas incrementa o tempo 
            timeOnlineAtual.timestampOnline += infoMember.timeOnline;
        } else { // Se não existir timeOnline para o dia atual, é atribuido o inicial
            timeOnlineAtual = infoTimeOnlineInicial;
        }

        usuariosSingleton.usuarios[indexUsuario].timeOnline.set(keyDataAtual, timeOnlineAtual);
    }
}

function atualizarCacheNicksUsuario(indexUsuario: number, userDiscord: User, indexNick: number, nickInfoNovo: INickInfo): void {
    // Usuário novo sem nick (Adicionar usuário e nick)
    if (indexUsuario === -1) {
        usuariosSingleton.usuarios.push({
            id: userDiscord.id,
            name: userDiscord.username,
            timestampsAnotacoes: [],
            totalTimeOnline: 0,
            nicks: [nickInfoNovo],
            timeOnline: new Map<string, ITimeOnlineInfo>()
        });
    // Usuário velho com nick (Atualizar nick)
    } else if (indexNick > -1) { 
        usuariosSingleton.usuarios[indexUsuario].nicks[indexNick] = nickInfoNovo;
    // Usuário velho sem nick (Adicionar nick)
    } else {
        usuariosSingleton.usuarios[indexUsuario].nicks.push(nickInfoNovo);
    }
}

export {
    atualizarCacheTempoOnlineUsuario,
    atualizarCacheNicksUsuario
}