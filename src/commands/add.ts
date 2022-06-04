import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { AdicionarHorarioModal } from '../templates/modals/adicionar-horario-modal';

export class Add {
    data: SlashCommandBuilder = new SlashCommandBuilder().setName('add').setDescription('Adicione Horário de Boss!');

    async execute(interaction: CommandInteraction): Promise<void> {
		await interaction.showModal(new AdicionarHorarioModal().getModal());
    }
}