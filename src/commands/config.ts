import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord-api-types/v9";
import { CommandInteraction } from "discord.js";
import { config } from "../config/get-configs";
import { sincronizarConfigsBot } from "../db/db";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";
import { underbold } from "../utils/geral-utils";

export class Config {
    data = new SlashCommandBuilder()
        .setName('config')
        .setDescription('Realize configurações no bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand => {
            subcommand.setName('horario')
                .setDescription('Defina o intervalo inicial e final dos boss')
                .addNumberOption(option => option.setName('intervalo_inicial').setDescription('Qual o intervalo inicial?').setRequired(true).setMinValue(4).setMaxValue(12))
                .addNumberOption(option => option.setName('intervalo_final').setDescription('Qual o intervalo final?').setRequired(true).setMinValue(4).setMaxValue(12));
            return subcommand;
        });

    async execute(interaction: CommandInteraction): Promise<void> {
        const opcaoSubCommand = interaction.options.getSubcommand();

        if (opcaoSubCommand === "horario") {

            const intervaloInicial: number = interaction.options.getNumber('intervalo_inicial', true);
            const intervaloFinal: number = interaction.options.getNumber('intervalo_final', true);

            const intervaloInicialAntigo = config().mu.horaBossInicial;
            const intervaloFinalAntigo = config().mu.horaBossFinal;
            
            config().mu.horaBossInicial = intervaloInicial;
            config().mu.horaBossFinal = intervaloFinal;
            
            await sincronizarConfigsBot();

            const textoIntevaloAntigo: string = underbold(`${intervaloInicialAntigo}/${intervaloFinalAntigo}`);
            const textoIntevaloNovo: string = underbold(`${intervaloInicial}/${intervaloFinal}`);
            
            await interaction.deferReply();
            await interaction.deleteReply();
            await mostrarHorarios(interaction.channel);
            await interaction.channel?.send(`✅ ${interaction.user} intervalo dos boss alterado de ${textoIntevaloAntigo} para ${textoIntevaloNovo} horas`);
        }

    }
}