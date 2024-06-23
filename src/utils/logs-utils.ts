import { Interaction } from "discord.js";
import { config } from "../config/get-configs";
import { clientRabbitMQ } from "../services/rabbitmq/client-rabbitmq";
import { IParamsLogsGeral } from "../models/interface/params-logs-geral";
import { ILogsGeral } from "../models/interface/logs-geral";
import { TypeLog } from "../models/enum/type-log";
import { dataNowMoment } from "./data-utils";
import { ILogsErrosInput } from "../models/interface/logs-erros-input";
import { ErrorGeral } from "../models/error-geral";

const sendLogErroApp = (errorGeral: ErrorGeral): void => {
    clientRabbitMQ.produceMessage(config().rabbitmq.routingKeys.errosApp, JSON.stringify(errorGeral));
}

const sendLogErroInput = (interaction: Interaction, msgErroBoss: string): void => {
    clientRabbitMQ.produceMessage(config().rabbitmq.routingKeys.logsErrosInput, getLogsErrosInputString(interaction, msgErroBoss));
}

const sendLogGeral = (params?: IParamsLogsGeral): void => {
    clientRabbitMQ.produceMessage(config().rabbitmq.routingKeys.logsGeral, getLogsGeralString(params));
}

const getLogsErrosInputString = (interaction: Interaction, msgErroBoss: string): string => {
    const logInputErro = {
        userId: interaction.user.id,
        userName: interaction.user.tag,
        message: msgErroBoss,
        guildId: interaction.guild?.id,
        guildName: interaction.guild?.name,
        timestamp: interaction.createdTimestamp,
    } as ILogsErrosInput;
    
    return JSON.stringify(logInputErro);
}

const getLogsGeralString = (params?: IParamsLogsGeral): string => {
    if (!params) return '';

    const { cmdInteraction, client, msgInteraction, guild } = params;
    let log = {} as ILogsGeral;

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
        } as ILogsGeral;

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
        } as ILogsGeral;

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
        } as ILogsGeral;

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
        } as ILogsGeral;
    }

    return JSON.stringify(log);
}

export {
    sendLogErroApp,
    sendLogErroInput,
    sendLogGeral,
}