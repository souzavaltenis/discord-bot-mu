import { ActionRowBuilder, ModalBuilder, TextInputBuilder, ModalSubmitInteraction, EmbedBuilder, TextInputStyle, ModalActionRowComponentBuilder } from 'discord.js';
import { Ids } from '../../models/ids';
import { adicionarAnotacaoHorario, adicionarHorarioBoss } from '../../db/db';
import { mostrarHorarios } from '../messages/tabela-horario-boss';
import { config } from '../../config/get-configs';
import { dataNowMoment, dataNowString, distanceDatasInMinutes, momentToString, stringToMoment } from '../../utils/data-utils';
import { bold } from '@discordjs/builders';
import { Moment } from 'moment';
import { getNickMember, sendLogErroInput } from '../../utils/geral-utils';
import { IBossInfoAdd } from '../../models/interface/boss-info-add';
import { getEmbedAddBoss } from '../embeds/adicionar-boss-embed';

export class AdicionarHorarioModal {

    getModal(): ModalBuilder {
        const modalHorarioBoss = new ModalBuilder()
            .setCustomId(Ids.MODAL_ADICIONAR_HORARIO_BOSS)
            .setTitle('Adicionar Horário de Boss');

        const inputNomeBoss = new TextInputBuilder()
            .setCustomId(Ids.INPUT_NOME_BOSS)
            .setLabel("Qual boss?")
            .setPlaceholder("Ex: rei, fenix, relics, dbk, geno")
            .setMinLength(1)
            .setMaxLength(20)
            .setRequired(true)
            .setStyle(TextInputStyle.Short);
        
        const inputSalaBoss = new TextInputBuilder()
            .setCustomId(Ids.INPUT_SALA_BOSS)
            .setLabel("Qual sala?")
            .setPlaceholder("Ex: 3")
            .setMinLength(1)
            .setMaxLength(2)
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const inputHorarioBoss = new TextInputBuilder()
            .setCustomId(Ids.INPUT_HORARIO_BOSS)
            .setLabel("Qual horário?")
            .setPlaceholder("Ex: 21:45")
            .setMinLength(5)
            .setMaxLength(5)
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const inputPerguntaOntem = new TextInputBuilder()
            .setCustomId(Ids.INPUT_PERGUNTA_ONTEM)
            .setLabel("Foi ontem? Se não foi, pode deixar vazio.")
            .setPlaceholder("Ex: sim")
            .setMaxLength(3)
            .setRequired(false)
            .setStyle(TextInputStyle.Short);

        modalHorarioBoss.addComponents(
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(inputNomeBoss),
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(inputSalaBoss),
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(inputHorarioBoss),
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(inputPerguntaOntem)
        );

        return modalHorarioBoss;
    }

    async action(interaction: ModalSubmitInteraction) {
        const textInputNomeBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_NOME_BOSS)
            .trim()
            .toLocaleLowerCase()
            .normalize("NFD").replace(/\p{Diacritic}/gu, "");

        let nomeDocBoss = "";

        const valoresRei: string[] = config().geral.valoresNomeBoss.rei;
        const valoresRelics: string[] = config().geral.valoresNomeBoss.relics;
        const valoresFenix: string[] = config().geral.valoresNomeBoss.fenix;
        const valoresDbk: string[] = config().geral.valoresNomeBoss.dbk;
        const valoresGeno: string[] = config().geral.valoresNomeBoss.geno;
        
        switch (true) {
            case valoresRei.includes(textInputNomeBoss):    nomeDocBoss = config().documents.rei;       break;
            case valoresRelics.includes(textInputNomeBoss): nomeDocBoss = config().documents.relics;    break;
            case valoresFenix.includes(textInputNomeBoss):  nomeDocBoss = config().documents.fenix;     break;
            case valoresDbk.includes(textInputNomeBoss):    nomeDocBoss = config().documents.deathBeam; break;
            case valoresGeno.includes(textInputNomeBoss):   nomeDocBoss = config().documents.geno;      break;
        }

        if (!nomeDocBoss) {
            const msgErroBoss: string = `${interaction.user} Boss (${bold(textInputNomeBoss)}) não é reconhecido!`;
            await sendLogErroInput(interaction, msgErroBoss);
            await interaction.reply({
                content: msgErroBoss,
                ephemeral: true
            });
            return;
        }

        const textInputSalaBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_SALA_BOSS).replace(/\D/g, '');
        
        const salaBoss = parseInt(textInputSalaBoss);
        const salasConhecidas = config().mu.salasPermitidas;

        if (salaBoss === NaN || !salasConhecidas.includes(salaBoss)) {
            const msgErroSala: string = `${interaction.user} Sala (${bold(textInputSalaBoss)}) não é reconhecida! Use as salas ${salasConhecidas}.`;
            await sendLogErroInput(interaction, msgErroSala);
            await interaction.reply({
                content: msgErroSala,
                ephemeral: true
            });
            return;
        }

        const textInputHorarioBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_HORARIO_BOSS).replace(';', ':');

        if (!(/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/).test(textInputHorarioBoss)) {
            const msgErroHorario: string = `${interaction.user} Horário (${bold(textInputHorarioBoss)}) não é reconhecido! Use como exemplo: 15:46`;
            await sendLogErroInput(interaction, msgErroHorario);
            await interaction.reply({
                content: msgErroHorario,
                ephemeral: true
            });
            return;
        }

        const horarioInformado: Moment = stringToMoment(`${dataNowString('DD/MM/YYYY')} ${textInputHorarioBoss} -0300`)

        const inputPerguntaOntem: string = interaction.fields.getTextInputValue(Ids.INPUT_PERGUNTA_ONTEM);
        const foiOntem: boolean = inputPerguntaOntem.length > 0 && ['s', 'si', 'sim'].includes(inputPerguntaOntem.toLocaleLowerCase());

        if (!foiOntem && distanceDatasInMinutes(horarioInformado, dataNowMoment()) >= 40) {
            const msgErroHorarioData: string = `${interaction.user} Horário (${bold(textInputHorarioBoss)}) é muito distante! Se foi de ontem, preencha o campo (foi ontem?) com ${bold('sim')}.`;
            await sendLogErroInput(interaction, msgErroHorarioData);
            await interaction.reply({
                content: msgErroHorarioData,
                ephemeral: true
            });
            return;
        }

        if (foiOntem) {
            horarioInformado.subtract(1, 'day');
        }

        const bossInfo = {
            nomeDocBoss: nomeDocBoss,
            salaBoss: salaBoss+'',
            horarioInformado: momentToString(horarioInformado),
            timestampAcao: dataNowMoment().valueOf()
        } as IBossInfoAdd;

        adicionarHorarioBoss(bossInfo).then(async () => {
            const embedAddBoss: EmbedBuilder = getEmbedAddBoss(nomeDocBoss, horarioInformado, salaBoss, getNickMember(interaction));

            await interaction.reply({ embeds: [embedAddBoss] });
            await adicionarAnotacaoHorario(interaction.user, bossInfo.timestampAcao);
            await mostrarHorarios(interaction.channel);
        });
    }
}