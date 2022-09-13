import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { CategoryCommand } from "../models/enum/category-command";
import { SorteioModal } from "../templates/modals/sorteio-modal";

export = {
    category: CategoryCommand.GERAL,
    data: new SlashCommandBuilder()
        .setName('sorteio')
        .setDescription('Realize sorteio de itens'),
        
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.showModal(new SorteioModal().getModal());
    }
}