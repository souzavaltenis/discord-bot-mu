import { bold, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { sendLogErroInput } from "../utils/geral-utils";

export class Reset {
    data = new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Informe horário que o servidor voltou')
        .addStringOption(option => option.setName('horario').setDescription('Qual horário o servidor voltou?').setRequired(true))
        .addStringOption(option =>
            option.setName('foi_ontem')
                .setDescription('Esse horário foi ontem?')
                .setRequired(true)
                .addChoices({ name: 'Não', value: 'N' }, { name: 'Sim', value: 'S' })
                .setRequired(true));

    async execute(interaction: CommandInteraction): Promise<void> {

        const horario: string = interaction.options.getString('horario') || '';
        const foiontem: string = interaction.options.getString('foi_ontem') || '';

        if (!(/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/).test(horario)) {
            const msgErroHorario: string = `${interaction.user} Horário (${bold(horario)}) não é reconhecido! Use como exemplo: 15:46`;
            await sendLogErroInput(interaction, msgErroHorario);
            await interaction.reply(msgErroHorario);
            return;
        }

        await interaction.reply(`>>>COMANDO EM CONSTRUÇÃO<<< horario: ${horario} foi_ontem: ${foiontem}`);
    }
}