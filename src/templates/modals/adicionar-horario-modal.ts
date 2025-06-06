import { bold } from '@discordjs/builders';
import { ActionRowBuilder, EmbedBuilder, GuildMember, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Moment } from 'moment';
import { config } from '../../config/get-configs';
import { adicionarAnotacaoHorario, adicionarHorarioBoss, isBossAtivo } from '../../db/db';
import { Ids } from '../../models/ids';
import { IBossInfoAdd } from '../../models/interface/boss-info-add';
import { usuariosSingleton } from '../../models/singleton/usuarios-singleton';
import { consultarSalaPadrao } from '../../utils/boss-utils';
import { dataNowMoment, dataNowString, distanceDatasInMinutes, momentToString, stringToMoment } from '../../utils/data-utils';
import { getNickMember } from '../../utils/geral-utils';
import { sendLogErroInput } from '../../utils/logs-utils';
import { getEmbedAddBoss } from '../embeds/adicionar-boss-embed';
import { mostrarHorarios } from '../messages/tabela-horario-boss';

export class AdicionarHorarioModal {

    getModal(): ModalBuilder {
        const modalHorarioBoss = new ModalBuilder()
            .setCustomId(Ids.MODAL_ADICIONAR_HORARIO_BOSS)
            .setTitle('Adicionar Horário de Boss');

        const inputNomeBoss = new TextInputBuilder()
            .setCustomId(Ids.INPUT_NOME_BOSS)
            .setLabel("Qual boss?")
            .setPlaceholder("Ex: rei, fenix, relics, dbk, geno, hell, red, hydra")
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
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(this.verificarInputSala(inputSalaBoss)),
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(inputHorarioBoss),
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(inputPerguntaOntem)
        );

        return modalHorarioBoss;
    }

    verificarInputSala(inputSala: TextInputBuilder): TextInputBuilder {
        const salaPadrao: string = consultarSalaPadrao();

        if (salaPadrao) {
            inputSala.setValue(salaPadrao);
        }

        return inputSala;
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
        const valoresHell: string[] = config().geral.valoresNomeBoss.hell;
        const valoresRed: string[] = config().geral.valoresNomeBoss.red;
        const valoresHydra: string[] = config().geral.valoresNomeBoss.hydra;

        switch (true) {
            case valoresRei.includes(textInputNomeBoss): nomeDocBoss = config().documents.rei; break;
            case valoresRelics.includes(textInputNomeBoss): nomeDocBoss = config().documents.relics; break;
            case valoresFenix.includes(textInputNomeBoss): nomeDocBoss = config().documents.fenix; break;
            case valoresDbk.includes(textInputNomeBoss): nomeDocBoss = config().documents.deathBeam; break;
            case valoresGeno.includes(textInputNomeBoss): nomeDocBoss = config().documents.geno; break;
            case valoresHell.includes(textInputNomeBoss): nomeDocBoss = config().documents.hell; break;
            case valoresRed.includes(textInputNomeBoss): nomeDocBoss = config().documents.red; break;
            case valoresHydra.includes(textInputNomeBoss): nomeDocBoss = config().documents.hydra; break;
        }

        if (!nomeDocBoss) {
            const msgErroBoss: string = `${interaction.user} Boss (${bold(textInputNomeBoss)}) não é reconhecido!`;
            sendLogErroInput(interaction, msgErroBoss);
            return await interaction.reply({
                content: msgErroBoss,
                ephemeral: true
            });
        }

        const bossAtivo: boolean = await isBossAtivo(nomeDocBoss);

        if (!bossAtivo) {
            const msgErroBoss: string = `${interaction.user} Boss (${bold(textInputNomeBoss)}) está desativado no bot!`;
            sendLogErroInput(interaction, msgErroBoss);
            return await interaction.reply({
                content: msgErroBoss,
                ephemeral: true
            });
        }

        const textInputSalaBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_SALA_BOSS).replace(/\D/g, '');

        const salaBoss: number = parseInt(textInputSalaBoss);
        const salasConhecidas: number[] = config().mu.salasPermitidas.sort((a: number, b: number) => a - b);

        if (Number.isNaN(salaBoss) || !salasConhecidas.includes(salaBoss)) {
            const msgErroSala: string = `${interaction.user} Sala (${bold(textInputSalaBoss)}) não é reconhecida! Use as salas ${salasConhecidas}.`;
            sendLogErroInput(interaction, msgErroSala);
            return await interaction.reply({
                content: msgErroSala,
                ephemeral: true
            });
        }

        const textInputHorarioBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_HORARIO_BOSS).replace(';', ':');

        if (!(/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/).test(textInputHorarioBoss)) {
            const msgErroHorario: string = `${interaction.user} Horário (${bold(textInputHorarioBoss)}) não é reconhecido! Use como exemplo: 15:46`;
            sendLogErroInput(interaction, msgErroHorario);
            return await interaction.reply({
                content: msgErroHorario,
                ephemeral: true
            });
        }

        const horarioInformado: Moment = stringToMoment(`${dataNowString('DD/MM/YYYY')} ${textInputHorarioBoss} -0300`)

        const inputPerguntaOntem: string = interaction.fields.getTextInputValue(Ids.INPUT_PERGUNTA_ONTEM);
        const foiOntem: boolean = inputPerguntaOntem.length > 0 && ['s', 'si', 'sim'].includes(inputPerguntaOntem.toLocaleLowerCase());

        if (!foiOntem && distanceDatasInMinutes(horarioInformado, dataNowMoment()) >= 40) {
            const msgErroHorarioData: string = `${interaction.user} Horário (${bold(textInputHorarioBoss)}) é muito distante! Se foi de ontem, preencha o campo (foi ontem?) com ${bold('sim')}.`;
            sendLogErroInput(interaction, msgErroHorarioData);
            return await interaction.reply({
                content: msgErroHorarioData,
                ephemeral: true
            });
        }

        if (foiOntem) {
            horarioInformado.subtract(1, 'day');
        }

        const bossInfo = {
            nomeDocBoss: nomeDocBoss,
            salaBoss: salaBoss + '',
            horarioInformado: momentToString(horarioInformado),
            timestampAcao: dataNowMoment().valueOf()
        } as IBossInfoAdd;

        adicionarHorarioBoss(bossInfo).then(async () => {
            await adicionarAnotacaoHorario(interaction.member as GuildMember, bossInfo.timestampAcao);

            const quantidadeAnotacoesUsuario = usuariosSingleton.usuarios.find(u => u.id === interaction.user.id)?.timestampsAnotacoes?.length || 0;
            const embedAddBoss: EmbedBuilder = getEmbedAddBoss(nomeDocBoss, horarioInformado, salaBoss, getNickMember(interaction), quantidadeAnotacoesUsuario);

            await interaction.reply({ embeds: [embedAddBoss] });
            await mostrarHorarios(interaction.channel);
        });
    }
}