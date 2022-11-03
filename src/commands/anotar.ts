import { SlashCommandBuilder } from "@discordjs/builders";
import { bold, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Moment } from "moment";
import { config } from "../config/get-configs";
import { adicionarHorarioBoss, adicionarAnotacaoHorario } from "../db/db";
import { CategoryCommand } from "../models/enum/category-command";
import { IBossInfoAdd } from "../models/interface/boss-info-add";
import { getEmbedAddBoss } from "../templates/embeds/adicionar-boss-embed";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";
import { stringToMoment, dataNowString, distanceDatasInMinutes, dataNowMoment, momentToString } from "../utils/data-utils";
import { sendLogErroInput, getNickMember } from "../utils/geral-utils";

export = {
    category: CategoryCommand.BOSS,
    data: new SlashCommandBuilder()
        .setName('anotar')
        .setDescription('Adicione Horário de Boss!')
        .addStringOption(option => option.setName('horario').setDescription('Qual horário?').setRequired(true))
        .addStringOption(option => {
            option
            .setName('boss')
            .setDescription('Qual Boss?')
            .setRequired(true)
            .addChoices(
                { name: 'Rei Kundun', value: config().documents.rei },
                { name: 'Relics',     value: config().documents.relics },
                { name: 'Fenix',      value: config().documents.fenix },
                { name: 'Death Beam', value: config().documents.deathBeam },
                { name: 'Genocider',  value: config().documents.geno }
            );

            return option;
        })
        .addNumberOption(option => {
            option.setName('sala').setDescription('Qual sala?').setRequired(true);

            config().mu.salasPermitidas.forEach((sala: number) => {
                option.addChoices({ name: `Sala ${sala}`, value: sala});
            });

            return option;
        })
        .addStringOption(option => option.setName('foi_ontem').setDescription('Esse horário foi ontem?').addChoices({ name: 'Não', value: 'N' }, { name: 'Sim', value: 'S' })),
    
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const horario: string = (interaction.options.getString('horario') || '').replace(';', ':');
        const bossDoc: string = interaction.options.getString('boss') || '';
        const salaBoss: number = interaction.options.getNumber('sala') || 0;
        const foiontem: string = interaction.options.getString('foi_ontem') || '';

        if (!(/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/).test(horario)) {
            const msgErroHorario: string = `${interaction.user} Horário (${bold(horario)}) não é reconhecido! Use como exemplo: 15:46`;
            await sendLogErroInput(interaction, msgErroHorario);
            await interaction.reply({
                content: msgErroHorario,
                ephemeral: true
            });
            return;
        }

        const horarioMoment: Moment = stringToMoment(`${dataNowString('DD/MM/YYYY')} ${horario} -0300`)

        if (foiontem === 'N' && distanceDatasInMinutes(horarioMoment, dataNowMoment()) >= 40) {
            const msgErroHorarioData: string = `${interaction.user} Horário (${bold(horario)}) é muito distante! Se foi de ontem, preencha o campo (foi ontem?) com ${bold('Sim')}`;
            await sendLogErroInput(interaction, msgErroHorarioData);
            await interaction.reply({
                content: msgErroHorarioData,
                ephemeral: true
            });
            return;
        }

        if (foiontem === 'S') {
            horarioMoment.subtract(1, 'day');
        }

        const bossInfo = {
            nomeDocBoss: bossDoc,
            salaBoss: salaBoss + '',
            horarioInformado: momentToString(horarioMoment),
            timestampAcao: dataNowMoment().valueOf()
        } as IBossInfoAdd;

        await adicionarHorarioBoss(bossInfo).then(async () => {
            const embedAddBoss: EmbedBuilder = getEmbedAddBoss(bossDoc, horarioMoment, salaBoss, getNickMember(interaction));

            await interaction.reply({ embeds: [embedAddBoss] });
            await adicionarAnotacaoHorario(interaction.user, bossInfo.timestampAcao);
            await mostrarHorarios(interaction.channel);
        });
    }
}