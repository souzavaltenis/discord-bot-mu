import { config } from "../config/get-configs";
import { sendMessageKafka } from "../services/kafka/kafka-producer";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";
import { mainTextChannel } from "../utils/channels-utils";
import { dataNowString } from "../utils/data-utils";
import { getLogsGeralString } from "../utils/geral-utils";
import { initBackupListaBoss } from "../utils/backup-utils";
import { Client } from "discord.js";
import { statcord } from "../index";

export = {
    name: 'ready',
    execute: async (client: Client) => {
        console.log(`📌 Login realizado no ${client.user?.tag} ás ${dataNowString("HH:mm:ss DD/MM/YYYY")}`);

        await sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ client: client }));
        await mostrarHorarios(mainTextChannel());
        await statcord.autopost();

        initBackupListaBoss();
    }
}