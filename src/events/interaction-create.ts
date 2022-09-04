import { ApplicationCommandType, Interaction, InteractionType, TextChannel } from "discord.js";
import { client, statcord } from "../index";
import { config } from "../config/get-configs";
import { getLogsGeralString, sendLogErroInput } from "../utils/geral-utils";
import { sendMessageKafka } from "../services/kafka/kafka-producer";
import { Ids } from "../models/ids";
import { AdicionarHorarioModal } from "../templates/modals/adicionar-horario-modal";
import { commands } from "../models/singleton/commands-singleton";

export = {
    name: 'interactionCreate',
    execute: async (interaction: Interaction) => {
        if (interaction.type === InteractionType.ApplicationCommand) {
            if (interaction.channelId !== config().channels.textHorarios && interaction.user.id !== config().ownerId) {
                const textChannel = client.channels.cache.get(config().channels.textHorarios) as TextChannel;
                const msgWrongChannel: string = `${interaction.user} os comandos só podem ser utilizados no canal ${textChannel.name} (${textChannel.guild.name})`;
                await sendLogErroInput(interaction, msgWrongChannel);
                
                await interaction.reply({
                    content: msgWrongChannel,
                    ephemeral: true
                }).catch(e => console.log(e));

                return;
            }

            await sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ cmdInteraction: interaction }));
            await statcord.postCommand(interaction.commandName, interaction.user.id);

            if (interaction.commandType === ApplicationCommandType.ChatInput) {
                const command = commands.get(interaction.commandName);

                if (command) {
                    await command.execute(interaction);
                }
            }
        }

        if (interaction.type === InteractionType.ModalSubmit) {
            switch (interaction.customId) {
                case Ids.MODAL_ADICIONAR_HORARIO_BOSS: await new AdicionarHorarioModal().action(interaction); break;
            }
        }
        
        return;
    }
}