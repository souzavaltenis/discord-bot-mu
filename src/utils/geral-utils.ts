import { bold, underscore } from "@discordjs/builders";
import { APIButtonComponentWithCustomId, ButtonBuilder, ButtonStyle, GuildMember, Interaction } from "discord.js";
import { RecordMetadata } from "kafkajs";
import { Moment } from "moment";
import { config } from '../config/get-configs';
import { Boss } from "../models/boss";
import { TypeLog } from "../models/enum/type-log";
import { ILogsErrosInputKafka } from "../models/interface/kafka/logs-erros-input-kafka";
import { ILogsGeralKafka } from "../models/interface/kafka/logs-geral-kafka";
import { IParamsLogsGeral } from "../models/interface/params-logs-geral";
import { SalaBoss } from "../models/sala-boss";
import { geralSingleton } from "../models/singleton/geral-singleton";
import { sendMessageKafka } from "../services/kafka/kafka-producer";
import { vaiAbrirBoss } from "./boss-utils";
import { dataNowMoment } from "./data-utils";

const tracos = (quantidade: number): string => {
    let str: string = '';
    for(let i=0; i<quantidade; i++) {
        str += '-';
    }
    return str;
}

const numberToEmoji = (n: number): string => {
    switch(n) {
        case 0: return ':zero:';
        case 1: return ':one:';
        case 2: return ':two:';
        case 3: return ':three:';
        case 4: return ':four:';
        case 5: return ':five:';
        case 6: return ':six:';
        case 7: return ':seven:';
        case 8: return ':eight:';
        case 9: return ':nine:';
        case 10: return ':keycap_ten:';
        default: return '';
    }
}

const numbersToEmoji = (n: number): string => {
    const emojisUnicode: string[] = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    const digits: number[] = n.toString().split('').map(Number);
    return digits.reduce((acc: string, digit: number) => acc + emojisUnicode[digit], '');
}

const underbold = (str: string): string => {
    return underscore(bold(str));
}

const getNomeBossByDoc = (nomeDocBoss: string): string => {
    switch(nomeDocBoss) {
        case config().documents.rei:       return "Rei Kundun";
        case config().documents.relics:    return "Relics";
        case config().documents.fenix:     return "Fenix";
        case config().documents.deathBeam: return "Death Beam";
        case config().documents.geno:      return "Genocider";
        default: return '';
    }
}

const getIdBossByDoc = (nomeDocBoss: string): number => {
    switch(nomeDocBoss) {
        case config().documents.rei:       return 1;
        case config().documents.relics:    return 2;
        case config().documents.fenix:     return 3;
        case config().documents.deathBeam: return 4;
        case config().documents.geno:      return 5;
        default: return 0;
    }
}

const formatInfosInputs = (nomeDocBoss: string, salaBoss: number, horarioInformado: Moment): string => {
    const nomeBoss: string = getNomeBossByDoc(nomeDocBoss);
    const infoHorario: string = horarioInformado.format('HH:mm');
    const infoData: string = horarioInformado.format('DD/MM');
    return `${underbold(nomeBoss)} sala ${underbold(salaBoss+'')} às ${underbold(infoHorario)} dia ${underbold(infoData)}`;
}

const gerarTabelaSalas = (listaBoss: Boss[]): Map<number, SalaBoss[]> => {
    const mapSalasHorarios = new Map<number, SalaBoss[]>();

    config().mu.salasPermitidas.forEach((sala: number) => {
        mapSalasHorarios.set(sala, [] as SalaBoss[]);
    });

    listaBoss.forEach((boss: Boss) => {
        boss.salas.forEach((horario: Moment, sala: number) => {
            mapSalasHorarios.get(sala)?.push(new SalaBoss(sala, boss.nome, horario));
        });
    });

    return mapSalasHorarios;
}

const gerarListaSalaBoss = (listaBoss: Boss[]): SalaBoss[] => {
    let listaSalaBoss = [] as SalaBoss[];

    listaBoss.forEach((boss: Boss) => {
        boss.salas.forEach((horario: Moment, sala: number) => {
            listaSalaBoss.push(new SalaBoss(sala, boss.nome, horario));
        });
    });
    
    listaSalaBoss = listaSalaBoss.filter((salaBoss: SalaBoss) => vaiAbrirBoss(salaBoss.horario));

    listaSalaBoss.sort((a: SalaBoss, b: SalaBoss) => {
        if (a.horario.isAfter(b.horario)) {
            return 1;
        }
        if (a.horario.isBefore(b.horario)) {
            return -1;
        }
        return 0;
    });

    return listaSalaBoss;
}

const getLogsGeralString = (params?: IParamsLogsGeral): string => {

    if (!params) return '';

    const { cmdInteraction, client, msgInteraction, guild } = params;
    let log = {} as ILogsGeralKafka;

    // On Command
    if (cmdInteraction) {
        log = {
            type: TypeLog.ON_COMMAND,
            userId: cmdInteraction.user?.id,
            userName: cmdInteraction.user?.tag,
            command: `/${cmdInteraction.commandName}`,
            guildId: cmdInteraction.guild?.id,
            guildName: cmdInteraction.guild?.name,
            timestamp: cmdInteraction.createdTimestamp
        } as ILogsGeralKafka;

    // On Ready
    } else if (client) {
        log = {
            type: TypeLog.ON_READY,
            userId: client.user?.id,
            userName: client.user?.tag,
            command: '',
            guildId: '',
            guildName: '',
            timestamp: dataNowMoment().valueOf()
        } as ILogsGeralKafka;

    // On Button Click
    } else if (msgInteraction) {
        log = {
            type: TypeLog.ON_BUTTON_CLICK,
            userId: msgInteraction.member?.user.id,
            userName: msgInteraction.member?.user.username,
            command: msgInteraction.customId,
            guildId: msgInteraction.guild?.id,
            guildName: msgInteraction.guild?.name,
            timestamp: msgInteraction.createdTimestamp
        } as ILogsGeralKafka;

    // On Guild Create
    } else if (guild) {
        log = {
            type: TypeLog.ON_GUILD_CREATE,
            userId: '',
            userName: '',
            command: '',
            guildId: guild.id,
            guildName: guild.name,
            timestamp: dataNowMoment().valueOf()
        } as ILogsGeralKafka;
    }

    return JSON.stringify(log);
}

const getLogsErrosInputString = (interaction: Interaction, msgErroBoss: string): string => {
    const logInputErro = {
        userId: interaction.user.id,
        userName: interaction.user.tag,
        message: msgErroBoss,
        guildId: interaction.guild?.id,
        guildName: interaction.guild?.name,
        timestamp: interaction.createdTimestamp,
    } as ILogsErrosInputKafka;
    
    return JSON.stringify(logInputErro);
}

const sendLogErroInput = async(interaction: Interaction, msgErroBoss: string): Promise<RecordMetadata[]> => {
    return await sendMessageKafka(config().kafka.topicLogsErrosInputBot, getLogsErrosInputString(interaction, msgErroBoss));
}

const sleep = async (ms: number): Promise<void> => {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

const textoFooter = (): string => {
    const textosFooter: string[] = config().dicasFooter;

    if (geralSingleton.indexDicaFooter > textosFooter.length - 1) {
        geralSingleton.indexDicaFooter = 0;
    }

    const dicaSelecionada: string = '\u200B\n' + textosFooter[geralSingleton.indexDicaFooter].replace(/\\n/g, '\n');

    geralSingleton.indexDicaFooter++;

    return dicaSelecionada;
}

const getIdButton = (button: ButtonBuilder): string => {
    if (button.data.style === ButtonStyle.Link) return '';
    return (button.data as Partial<APIButtonComponentWithCustomId>).custom_id || '';
}

const getNickMember = (interaction: Interaction): string => {
    return interaction.member instanceof GuildMember ? interaction.member.nickname || '' : '';
}

export { 
    tracos, 
    numberToEmoji, 
    numbersToEmoji, 
    underbold, 
    getNomeBossByDoc, 
    formatInfosInputs, 
    gerarTabelaSalas, 
    gerarListaSalaBoss,
    getLogsGeralString,
    getLogsErrosInputString,
    sendLogErroInput,
    sleep,
    textoFooter,
    getIdBossByDoc,
    getIdButton,
    getNickMember
}