import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";

export class List {
    data: SlashCommandBuilder = new SlashCommandBuilder().setName('list').setDescription('Lista os horários dos boss!');

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply();
        await interaction.deleteReply();
		await mostrarHorarios(interaction.channel);
    }
}