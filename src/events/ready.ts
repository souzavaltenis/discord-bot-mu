import { Client } from "discord.js";
import { geralSingleton } from "../models/singleton/geral-singleton";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";
import { initAllRoutinesBackups } from "../utils/backup-utils";
import { mainTextChannel } from "../utils/channels-utils";
import { dataNowMoment } from "../utils/data-utils";
import { sendLogGeral, sendLogHealth } from "../utils/logs-utils";

export = {
    name: 'ready',
    execute: async (client: Client) => {
        geralSingleton.onlineSince = dataNowMoment();

        console.log(`📌 Login realizado em ${client.user?.tag} ás ${geralSingleton.onlineSince.format("HH:mm:ss DD/MM/YYYY")}`);
        await mostrarHorarios(mainTextChannel());

        sendLogGeral({ client });
        initAllRoutinesBackups();
        setInterval(sendLogHealth, 60000);
    }
}