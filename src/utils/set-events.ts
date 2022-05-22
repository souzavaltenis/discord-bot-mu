import { Client, Guild, Interaction } from 'discord.js';
import { Add } from '../commands/add';
import { List } from '../commands/list';
import { AdicionarHorarioModal } from '../templates/adicionar-horario-modal';
import { deployCommands } from './deploy-commands';
import { Ids } from './ids';
import { clientId } from '../../config.json';
import { dataNow } from './data-now';

const setEvents = (client: Client): void => {

    client.on("guildCreate", (guild: Guild) => {
        console.log(`Bot adicionado ao servidor: ${guild.name} ás ${dataNow()}`);
        deployCommands(clientId, guild.id);
    });

    client.on('ready', (c: Client) => {
        console.log(`Logado como: ${c.user?.tag} ás ${dataNow()}`)
    });

    client.on('interactionCreate', async (interaction: Interaction) => {

        if (interaction.isCommand()) {
            console.log(`Comando /${interaction.commandName} realizado por ${interaction.user.tag} no ${interaction.guild?.name} ás ${dataNow()}`);
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