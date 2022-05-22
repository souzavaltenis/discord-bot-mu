import { Client, Guild, Interaction } from 'discord.js';
import { Add } from '../commands/add';
import { List } from '../commands/list';
import { AdicionarHorarioModal } from '../templates/adicionar-horario-modal';
import { deployCommands } from './deploy-commands';
import { Ids } from './ids';
import { clientId } from '../../config.json';
import { dataNow } from './data-now';
import { adicionarLog } from './db';

const setEvents = (client: Client): void => {

    client.on("guildCreate", (guild: Guild) => {
        adicionarLog(`Bot adicionado ao servidor: ${guild.name} ás ${dataNow()}`, "guildCreate");
        deployCommands(clientId, guild.id);
    });

    client.on('ready', (c: Client) => {
        adicionarLog(`Logado como: ${c.user?.tag} ás ${dataNow()}`, "onReady");
    });

    client.on('interactionCreate', async (interaction: Interaction) => {

        if (interaction.isCommand()) {
            adicionarLog(`/${interaction.commandName} realizado por ${interaction.user.tag} no ${interaction.guild?.name} ás ${dataNow()}`, "onCommand");
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