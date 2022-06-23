import { ModalActionRowComponent, MessageActionRow, Modal, TextInputComponent, ModalSubmitInteraction } from 'discord.js';
import { Ids } from '../../models/ids';
import { adicionarAnotacaoHorario, adicionarHorarioBoss } from '../../db/db';
import { mostrarHorarios } from '../messages/tabela-horario-boss';
import { config } from '../../config/get-configs';
import { dataNowMoment, dataNowString, distanceDatasInMinutes, momentToString, stringToMoment } from '../../utils/data-utils';
import { bold } from '@discordjs/builders';
import { Moment } from 'moment';
import { formatInfosInputs, sendLogErroInput } from '../../utils/geral-utils';
import { IBossInfoAdd } from '../../models/interface/boss-info-add';

export class AdicionarHorarioModal {

    getModal(): Modal {
        const modalHorarioBoss = new Modal()
            .setCustomId(Ids.MODAL_ADICIONAR_HORARIO_BOSS)
            .setTitle('Adicionar Horário de Boss');

        const inputNomeBoss = new TextInputComponent()
            .setCustomId(Ids.INPUT_NOME_BOSS)
            .setLabel("Qual boss?")
            .setPlaceholder("Ex: rei, fenix, relics, dbk, geno")
            .setMinLength(3)
            .setMaxLength(20)
            .setRequired(true)
            .setStyle('SHORT');
        
        const inputSalaBoss = new TextInputComponent()
            .setCustomId(Ids.INPUT_SALA_BOSS)
            .setLabel("Qual sala?")
            .setPlaceholder("Ex: 3")
            .setMinLength(1)
            .setMaxLength(1)
            .setRequired(true)
            .setStyle('SHORT');

        const inputHorarioBoss = new TextInputComponent()
            .setCustomId(Ids.INPUT_HORARIO_BOSS)
            .setLabel("Qual horário?")
            .setPlaceholder("Ex: 21:45")
            .setMinLength(5)
            .setMaxLength(5)
            .setRequired(true)
            .setStyle('SHORT');

        const inputPerguntaOntem = new TextInputComponent()
            .setCustomId(Ids.INPUT_PERGUNTA_ONTEM)
            .setLabel("Foi ontem? Se não foi, pode deixar vazio.")
            .setPlaceholder("Ex: sim")
            .setMaxLength(3)
            .setStyle('SHORT');

        modalHorarioBoss.addComponents(
            new MessageActionRow<ModalActionRowComponent>().addComponents(inputNomeBoss),
            new MessageActionRow<ModalActionRowComponent>().addComponents(inputSalaBoss),
            new MessageActionRow<ModalActionRowComponent>().addComponents(inputHorarioBoss),
            new MessageActionRow<ModalActionRowComponent>().addComponents(inputPerguntaOntem)
        );

        return modalHorarioBoss;
    }

    async action(interaction: ModalSubmitInteraction) {
        const textInputNomeBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_NOME_BOSS).trim().toLocaleLowerCase();

        let nomeDocBoss = "";

        const valoresRei: string[] = ['k', 'rk', 'rey', 'rei', 'rei kundun', 'reikundun', 'rey kundun', 'kundun'];
        const valoresRelics: string[] = ['i', 'rl', 'rel','relics', 'illusion', 'relycs', 'relcs', 'relic', 'relicks', 'illusion of kundun'];
        const valoresFenix: string[] = ['f','fenix', 'phoenix', 'phoênix', 'fênix', 'fnix', 'fenx', 'phoenix of darkness'];
        const valoresDbk: string[] = ['d','dbk', 'death', 'beam', 'death beam', 'db', 'dkb', 'dbl', 'deathbk', 'bk', 'death beam knigth'];
        const valoresGeno: string[] = ['g','geno', 'gen', 'gem', 'genocider', 'gneo', 'gno', 'ge', 'genocid', 'genocider'];

        switch (true) {
            case valoresRei.includes(textInputNomeBoss):    nomeDocBoss = config.bossFirestoreConfig.docs.docRei;       break;
            case valoresRelics.includes(textInputNomeBoss): nomeDocBoss = config.bossFirestoreConfig.docs.docRelics;    break;
            case valoresFenix.includes(textInputNomeBoss):  nomeDocBoss = config.bossFirestoreConfig.docs.docFenix;     break;
            case valoresDbk.includes(textInputNomeBoss):    nomeDocBoss = config.bossFirestoreConfig.docs.docDeathBeam; break;
            case valoresGeno.includes(textInputNomeBoss):    nomeDocBoss = config.bossFirestoreConfig.docs.docGeno;     break;
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

        const textInputSalaBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_SALA_BOSS);
        
        const salaBoss = parseInt(textInputSalaBoss);
        const salasConhecidas = config.bossFirestoreConfig.salasPermitidas;

        if (salaBoss === NaN || !salasConhecidas.includes(salaBoss)) {
            const msgErroSala: string = `${interaction.user} Sala (${bold(textInputSalaBoss)}) não é reconhecida! Use as salas ${salasConhecidas}.`;
            await sendLogErroInput(interaction, msgErroSala);
            await interaction.reply({
                content: msgErroSala,
                ephemeral: true
            });
            return;
        }

        const textInputHorarioBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_HORARIO_BOSS);

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
            const msgErroHorarioData: string = `${interaction.user} Horário (${bold(textInputHorarioBoss)}) é muito distante! Se foi de ontem, preencha o último campo com ${bold('sim')}.`;
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
            salaBoss: textInputSalaBoss,
            horarioInformado: momentToString(horarioInformado),
            timestampAcao: dataNowMoment().valueOf()
        } as IBossInfoAdd;

        adicionarHorarioBoss(bossInfo).then(async () => {
            const infosInputs: string = formatInfosInputs(nomeDocBoss, salaBoss, horarioInformado);
            await interaction.reply(`${interaction.user} Horário adicionado com sucesso! (${infosInputs})`);
            await adicionarAnotacaoHorario(interaction.user, bossInfo.timestampAcao);
            await mostrarHorarios(interaction.channel);
        });
    }
}