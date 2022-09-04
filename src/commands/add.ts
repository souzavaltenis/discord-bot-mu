import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { AdicionarHorarioModal } from "../templates/modals/adicionar-horario-modal";

export = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adicione Horário de Boss!'),
        
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.showModal(new AdicionarHorarioModal().getModal());
    }
}