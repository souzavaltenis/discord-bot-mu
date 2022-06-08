import { Client, Guild, Interaction } from 'discord.js';
import { Add } from '../commands/add';
import { List } from '../commands/list';
import { AdicionarHorarioModal } from '../templates/modals/adicionar-horario-modal';
import { deployCommands } from './deploy-commands';
import { Ids } from '../models/ids';
import { config } from '../config/get-configs';
import { adicionarLog, consultarHorarioBoss } from '../db/db';
import { Boss } from '../models/boss';
import { agendarAvisos } from './avisos-utils';
import { dataNowString } from './data-utils';

const setEvents = (client: Client): void => {

    client.on("guildCreate", (guild: Guild) => {
        adicionarLog(`OnGuildCreate: Adicionado ao servidor: ${guild.name}`);
        deployCommands(config.clientId, guild.id);
    });

    client.on('ready', (client: Client) => {
        console.log(`Logado como: ${client.user?.tag} ás ${dataNowString("HH:mm:ss DD/MM/YYYY")}`);
        adicionarLog(`OnReady: Logado como: ${client.user?.tag}`);
        consultarHorarioBoss().then((listaBoss: Boss[]) => {
            agendarAvisos(listaBoss);
        });
    });

    client.on('interactionCreate', async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            adicionarLog(`OnCommand: /${interaction.commandName} por ${interaction.user.tag} em ${interaction.guild?.name}`);
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