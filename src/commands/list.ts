import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { mostrarSalas } from "../templates/tabela-horario-boss";

export class List {
    data: SlashCommandBuilder = new SlashCommandBuilder().setName('list').setDescription('Lista os horários dos boss!');

    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply()
        await interaction.deleteReply()
		await mostrarSalas(interaction.channel);
    }
}