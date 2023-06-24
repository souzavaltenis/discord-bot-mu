import { MessageContextMenuCommandInteraction } from "discord.js";
import { commands } from "../models/singleton/commands-singleton";

export = {
    name: 'MessageContextMenuCommandInteraction',
    action: async (interaction: MessageContextMenuCommandInteraction): Promise<void> => {
        const command = commands.get(interaction.commandName);
        
        await command?.execute(interaction);
    }
}