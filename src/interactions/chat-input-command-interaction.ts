import { ChatInputCommandInteraction, channelMention, ApplicationCommandType } from "discord.js";
import { config } from "../config/get-configs";
import { CategoryCommand } from "../models/enum/category-command";
import { commands } from "../models/singleton/commands-singleton";
import { sendMessageKafka } from "../services/kafka/kafka-producer";
import { getNameCommandsByCategory, sendLogErroInput, getLogsGeralString } from "../utils/geral-utils";

export = {
    name: 'ChatInputCommandInteraction',
    action: async (interaction: ChatInputCommandInteraction): Promise<void> => {
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

        if ([ApplicationCommandType.ChatInput, ApplicationCommandType.Message].includes(interaction.commandType)) {
            const command = commands.get(interaction.commandName);

            if (command) {
                await command.execute(interaction);
            }
        }
    }
}