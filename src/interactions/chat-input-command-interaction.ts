import { ChatInputCommandInteraction, channelMention, ApplicationCommandType } from "discord.js";
import { config } from "../config/get-configs";
import { CategoryCommand } from "../models/enum/category-command";
import { commands } from "../models/singleton/commands-singleton";
import { getNameCommandsByCategory } from "../utils/geral-utils";
import { sendLogErroInput, sendLogGeral } from "../utils/logs-utils";

export = {
    name: 'ChatInputCommandInteraction',
    action: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (getNameCommandsByCategory(CategoryCommand.BOSS).includes(interaction.commandName) && interaction.channelId !== config().channels.textHorarios && interaction.user.id !== config().ownerId) {
            const msgWrongChannel: string = `${interaction.user} esse comando só pode ser utilizado no canal ${channelMention(config().channels.textHorarios)}`;
            sendLogErroInput(interaction, msgWrongChannel);
            
            await interaction.reply({
                content: msgWrongChannel,
                ephemeral: true
            }).catch(e => console.log(e));

            return;
        }

        sendLogGeral({ cmdInteraction: interaction });

        if ([ApplicationCommandType.ChatInput, ApplicationCommandType.Message].includes(interaction.commandType)) {
            const command = commands.get(interaction.commandName);

            if (command) {
                await command.execute(interaction);
            }
        }
    }
}