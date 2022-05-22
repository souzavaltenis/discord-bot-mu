import { Client, Guild, Interaction } from 'discord.js';
import { Add } from '../commands/add';
import { List } from '../commands/list';
import { AdicionarHorarioModal } from '../templates/adicionar-horario-modal';
import { deployCommands } from './deploy-commands';
import { Ids } from './ids';
import { clientId } from '../../config.json';

const setEvents = (client: Client): void => {

    client.on("guildCreate", (guild: Guild) => {
        console.log(`Bot adicionado ao servidor: ${guild.name}`);
        deployCommands(clientId, guild.id);
    });

    client.on('ready', (c: Client) => {
        console.log(`Logado como: ${c.user?.tag}`)
    });

    client.on('interactionCreate', async (interaction: Interaction) => {

        if (interaction.isCommand()) {
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