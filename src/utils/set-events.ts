import { Client, Guild, Interaction } from 'discord.js';
import { Add } from '../commands/add';
import { List } from '../commands/list';
import { AdicionarHorarioModal } from '../templates/adicionar-horario-modal';
import { deployCommands } from './deploy-commands';
import { Ids } from './ids';
import { clientId } from '../../config.json';
import { adicionarLog } from '../db/db';
import { dataNowString } from './boss-utils';

const setEvents = (client: Client): void => {

    client.on("guildCreate", (guild: Guild) => {
        adicionarLog(`[${dataNowString('HH:mm:ss')}] OnGuildCreate: Adicionado ao servidor: ${guild.name}`);
        deployCommands(clientId, guild.id);
    });

    client.on('ready', (c: Client) => {
        adicionarLog(`[${dataNowString('HH:mm:ss')}] OnReady: Logado como: ${c.user?.tag}`);
    });

    client.on('interactionCreate', async (interaction: Interaction) => {

        if (interaction.isCommand()) {
            adicionarLog(`[${dataNowString('HH:mm:ss')}] OnCommand: /${interaction.commandName} por ${interaction.user.tag} em ${interaction.guild?.name}`);
            switch (interaction.commandName) {
                case 'add': await new Add().execute(interaction); break;
                case 'list': await new List().execute(interaction); break;
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