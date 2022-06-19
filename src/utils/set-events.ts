import { Client, Guild, Interaction } from 'discord.js';
import { Add } from '../commands/add';
import { List } from '../commands/list';
import { AdicionarHorarioModal } from '../templates/modals/adicionar-horario-modal';
import { deployCommands } from './deploy-commands';
import { Ids } from '../models/ids';
import { config } from '../config/get-configs';
import { consultarHorarioBoss } from '../db/db';
import { Boss } from '../models/boss';
import { agendarAvisos } from './avisos-utils';
import { dataNowString } from './data-utils';
import { sendMessageKafka } from '../services/kafka/kafka-producer';
import { getLogsGeralString } from './geral-utils';
import { Reset } from '../commands/reset';
import { Anotar } from '../commands/anotar';
import { Help } from '../commands/help';
import { Say } from '../commands/say';

const setEvents = (client: Client): void => {

    client.on("guildCreate", async (guild: Guild) => {
        await sendMessageKafka(config.kafkaConfig.topicLogsGeralBot, getLogsGeralString({ guild: guild }));
    });

    client.on('ready', async (client: Client) => {
        console.log(`Logado como: ${client.user?.tag} ás ${dataNowString("HH:mm:ss DD/MM/YYYY")}`);
        await sendMessageKafka(config.kafkaConfig.topicLogsGeralBot, getLogsGeralString({ client: client }));

        consultarHorarioBoss().then((listaBoss: Boss[]) => agendarAvisos(listaBoss));

        client.guilds.cache.forEach(async (guild: Guild) => {
            deployCommands(client, guild);
        });
    });

    client.on('interactionCreate', async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await sendMessageKafka(config.kafkaConfig.topicLogsGeralBot, getLogsGeralString({ cmdInteraction: interaction }));
            switch (interaction.commandName) {
                case 'add': await new Add().execute(interaction); break;
                case 'anotar': await new Anotar().execute(interaction); break;
                case 'list': await new List().execute(interaction); break;
                case 'reset': await new Reset().execute(interaction); break;
                case 'help': await new Help().execute(interaction); break;
                case 'say': await new Say().execute(interaction); break;
            }
        }

        if (interaction.isModalSubmit()) {
            switch (interaction.customId) {
                case Ids.MODAL_ADICIONAR_HORARIO_BOSS: await new AdicionarHorarioModal().action(interaction); break;
            }
        }
    });

}

export { setEvents }