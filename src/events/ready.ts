import { config } from "../config/get-configs";
import { sendMessageKafka } from "../services/kafka/kafka-producer";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";
import { mainTextChannel } from "../utils/channels-utils";
import { dataNowMoment } from "../utils/data-utils";
import { getLogsGeralString } from "../utils/geral-utils";
import { initAllRoutinesBackups } from "../utils/backup-utils";
import { Client } from "discord.js";
import { geralSingleton } from "../models/singleton/geral-singleton";

export = {
    name: 'ready',
    execute: async (client: Client) => {
        geralSingleton.onlineSince = dataNowMoment();

        console.log(`📌 Login realizado em ${client.user?.tag} ás ${geralSingleton.onlineSince.format("HH:mm:ss DD/MM/YYYY")}`);

        await sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ client: client }));
        await mostrarHorarios(mainTextChannel());

        initAllRoutinesBackups();
    }
}