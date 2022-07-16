import { Client, Guild, Interaction, TextChannel, VoiceState } from 'discord.js';
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
import { getLogsGeralString, sendLogErroInput } from './geral-utils';
import { Reset } from '../commands/reset';
import { Anotar } from '../commands/anotar';
import { Help } from '../commands/help';
import { ListBossSingleton } from '../models/singleton/list-boss-singleton';
import { Config } from '../commands/config';
import { Sala } from '../commands/sala';
import { Admin } from '../commands/admin';
import { Client as ClientStatcord} from 'statcord.js';
import { client } from '../index';
import { mostrarHorarios } from '../templates/messages/tabela-horario-boss';

const setEvents = (): void => {
    const statcord = new ClientStatcord({ client: client, key: config().bot.keyStatcord });

    client.on("guildCreate", async (guild: Guild) => {
        await sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ guild: guild }));
    });

    client.on('ready', async (client: Client) => {
        console.log(`Logado como: ${client.user?.tag} ás ${dataNowString("HH:mm:ss DD/MM/YYYY")}`);
        await sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ client: client }));

        consultarHorarioBoss().then((listaBoss: Boss[]) => {
            ListBossSingleton.getInstance().boss = listaBoss;
            agendarAvisos(listaBoss);
        });

        client.guilds.cache.forEach(async (guild: Guild) => {
            await deployCommands(client, guild);
        });

        await mostrarHorarios();
        await statcord.autopost();
    });

    client.on('interactionCreate', async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            if (interaction.channelId !== config().channels.textHorarios && interaction.user.id !== config().ownerId) {
                const textChannel = client.channels.cache.get(config().channels.textHorarios) as TextChannel;
                const msgWrongChannel: string = `${interaction.user} os comandos só podem ser utilizados no canal ${textChannel}`;
                await sendLogErroInput(interaction, msgWrongChannel);
                return await interaction.reply({
                    content: msgWrongChannel,
                    ephemeral: true
                }).catch(e => console.log(e));
            }

            await sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ cmdInteraction: interaction }));
            await statcord.postCommand(interaction.commandName, interaction.user.id);

            switch (interaction.commandName) {
                case 'add': await new Add().execute(interaction); break;
                case 'admin': await new Admin().execute(interaction); break;
                case 'anotar': await new Anotar().execute(interaction); break;
                case 'config': await new Config().execute(interaction); break;
                case 'list': await new List().execute(interaction); break;
                case 'reset': await new Reset().execute(interaction); break;
                case 'help': await new Help().execute(interaction); break;
                case 'sala': await new Sala().execute(interaction); break;
            }
        }

        if (interaction.isModalSubmit()) {
            switch (interaction.customId) {
                case Ids.MODAL_ADICIONAR_HORARIO_BOSS: await new AdicionarHorarioModal().action(interaction); break;
            }
        }
    });

    client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
        // Connect main channel
        if(oldState.channelId === null && newState.channelId === config().channels.voiceHorarios) {
            await oldState.member?.roles.add(config().cargos.horarios);
        }
        // Disconect main channel
        if (newState.channelId === null && oldState.channelId === config().channels.voiceHorarios) {
            await newState.member?.roles.remove(config().cargos.horarios);
        }
        // Move from main channel to other channel
        if(oldState.channelId === config().channels.voiceHorarios && newState.channelId !== config().channels.voiceHorarios) {
            await newState.member?.roles.remove(config().cargos.horarios);
        }
        // Move from other channel to main channel
        if(oldState.channelId !== config().channels.voiceHorarios && newState.channelId === config().channels.voiceHorarios) {
            await oldState.member?.roles.add(config().cargos.horarios);
        }
        // If mute audio on main channel, move to afk channel
        if (!newState.member?.roles.cache.has(config().cargos.headset) && newState.selfDeaf && newState.channelId === config().channels.voiceHorarios) {
            await newState.member?.voice.setChannel(config().channels.voiceAfk);
        }
        // If unmute audio on afk channel, move to main channel
        if (!newState.member?.roles.cache.has(config().cargos.headset) && oldState.channelId === config().channels.voiceAfk && !newState.selfDeaf && newState.channelId === config().channels.voiceAfk) {
            await newState.member?.voice.setChannel(config().channels.voiceHorarios);
        }
    });
}

export { setEvents }