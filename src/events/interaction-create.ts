import { ApplicationCommandType, channelMention, Interaction, InteractionType } from "discord.js";
import { statcord } from "../index";
import { config } from "../config/get-configs";
import { getLogsGeralString, getNameCommandsByCategory, sendLogErroInput } from "../utils/geral-utils";
import { sendMessageKafka } from "../services/kafka/kafka-producer";
import { Ids } from "../models/ids";
import { AdicionarHorarioModal } from "../templates/modals/adicionar-horario-modal";
import { commands } from "../models/singleton/commands-singleton";
import { SorteioModal } from "../templates/modals/sorteio-modal";
import { CategoryCommand } from "../models/enum/category-command";

export = {
    name: 'interactionCreate',
    execute: async (interaction: Interaction) => {
        if (interaction.type === InteractionType.ApplicationCommand) {
            if (getNameCommandsByCategory(CategoryCommand.BOSS).includes(interaction.commandName) && interaction.channelId !== config().channels.textHorarios && interaction.user.id !== config().ownerId) {
                const msgWrongChannel: string = `${interaction.user} esse comando só pode ser utilizado no canal ${channelMention(config().channels.textHorarios)}`;
                await sendLogErroInput(interaction, msgWrongChannel);
                
                await interaction.reply({
                    content: msgWrongChannel,
                    ephemeral: true
                }).catch(e => console.log(e));

                return;
            }

            await sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ cmdInteraction: interaction }));
            await statcord.postCommand(interaction.commandName, interaction.user.id);

            if ([ApplicationCommandType.ChatInput, ApplicationCommandType.Message].includes(interaction.commandType)) {
                const command = commands.get(interaction.commandName);

                if (command) {
                    await command.execute(interaction);
                }
            }
        }

        if (interaction.type === InteractionType.ModalSubmit) {
            switch (interaction.customId) {
                case Ids.MODAL_ADICIONAR_HORARIO_BOSS: await new AdicionarHorarioModal().action(interaction); break;
                case Ids.MODAL_SORTEIO_DROPS: await new SorteioModal().action(interaction); break;
            }
        }
        
        return;
    }
}