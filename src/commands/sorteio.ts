import { SlashCommandBuilder } from "@discordjs/builders";
import { channelMention, ChatInputCommandInteraction } from "discord.js";
import { config } from "../config/get-configs";
import { SorteioModal } from "../templates/modals/sorteio-modal";

export = {
    data: new SlashCommandBuilder()
        .setName('sorteio')
        .setDescription('Realize sorteio de itens'),
        
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (interaction.channelId === config().channels.textSorteios || interaction.user.id === config().ownerId) {
            await interaction.showModal(new SorteioModal().getModal());
        } else {
            await interaction.reply({
                content: `Os sorteios só podem ser realizados no canal ${channelMention(config().channels.textSorteios)}`,
                ephemeral: true
            });
        }
    }
}