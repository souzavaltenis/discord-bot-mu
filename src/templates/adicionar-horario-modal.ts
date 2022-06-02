import { ModalActionRowComponent, MessageActionRow, Modal, TextInputComponent, ModalSubmitInteraction } from 'discord.js';
import { Ids } from '../models/ids';
import { adicionarHorarioBoss } from '../db/db';
import { mostrarHorarios } from './tabela-horario-boss';
import { config } from '../config/get-configs';
import { dataNowMoment, dataNowString, distanceDatasInMinutes, momentToString, stringToMoment } from '../utils/data-utils';
import { bold } from '@discordjs/builders';
import { Moment } from 'moment';
import { formatInfosInputs } from '../utils/geral-utils';

export class AdicionarHorarioModal {

    getModal(): Modal {
        const modalHorarioBoss = new Modal()
            .setCustomId(Ids.MODAL_ADICIONAR_HORARIO_BOSS)
            .setTitle('Adicionar Horário de Boss');

        const inputNomeBoss = new TextInputComponent()
            .setCustomId(Ids.INPUT_NOME_BOSS)
            .setLabel("Qual boss?")
            .setPlaceholder("Ex: rei, fenix, relics, dbk")
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
        const textInputNomeBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_NOME_BOSS).toLocaleLowerCase();

        let nomeDocBoss = "";

        const valoresRei: string[] = ['k', 'rk', 'rey', 'rei', 'rei kundun', 'reikundun', 'rey kundun', 'kundun'];
        const valoresRelics: string[] = ['i', 'rl', 'rel','relics', 'illusion', 'relycs', 'relcs', 'relic', 'illusion of kundun'];
        const valoresFenix: string[] = ['f','fenix', 'phoenix', 'phoênix', 'fênix', 'fnix', 'fenx', 'phoenix of darkness'];
        const valoresDbk: string[] = ['d','dbk', 'death', 'beam', 'death beam', 'db', 'dkb', 'dbl', 'deathbk', 'bk', 'death beam knigth'];

        switch (true) {
            case valoresRei.includes(textInputNomeBoss):    nomeDocBoss = config.bossFirestoreConfig.docs.docRei;       break;
            case valoresRelics.includes(textInputNomeBoss): nomeDocBoss = config.bossFirestoreConfig.docs.docRelics;    break;
            case valoresFenix.includes(textInputNomeBoss):  nomeDocBoss = config.bossFirestoreConfig.docs.docFenix;     break;
            case valoresDbk.includes(textInputNomeBoss):    nomeDocBoss = config.bossFirestoreConfig.docs.docDeathBeam; break;
        }

        if (!nomeDocBoss) {
            await interaction.reply(`${interaction.user} Boss ${textInputNomeBoss} não é reconhecido!`);
            return;
        }

        const textInputSalaBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_SALA_BOSS);
        
        const salaBoss = parseInt(textInputSalaBoss);
        const salasConhecidas = config.bossFirestoreConfig.salasPermitidas;

        if (salaBoss === NaN || !salasConhecidas.includes(salaBoss)) {
            await interaction.reply(`${interaction.user} Sala ${textInputSalaBoss} não é reconhecida! Use as salas ${salasConhecidas}.`);
            return;
        }

        const textInputHorarioBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_HORARIO_BOSS);

        if (!(/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/).test(textInputHorarioBoss)) {
            await interaction.reply(`${interaction.user} Horário ${bold(textInputHorarioBoss)} não é reconhecido! Use como exemplo: 15:46`);
            return;
        }

        const horarioInformado: Moment = stringToMoment(`${dataNowString('DD/MM/YYYY')} ${textInputHorarioBoss} -0300`)

        const inputPerguntaOntem: string = interaction.fields.getTextInputValue(Ids.INPUT_PERGUNTA_ONTEM);
        const foiOntem: boolean = inputPerguntaOntem.length > 0 && ['s', 'si', 'sim'].includes(inputPerguntaOntem.toLocaleLowerCase());

        if (!foiOntem && distanceDatasInMinutes(horarioInformado, dataNowMoment()) >= 40) {
            await interaction.reply(`${interaction.user} Horário ${bold(textInputHorarioBoss)} é muito distante! Se foi de ontem, preencha o último campo com ${bold('sim')}.`);
            return;
        }

        if (foiOntem) {
            horarioInformado.subtract(1, 'day');
        }

        adicionarHorarioBoss(nomeDocBoss, salaBoss, momentToString(horarioInformado)).then(async () => {
            const infosInputs: string = formatInfosInputs(nomeDocBoss, salaBoss, horarioInformado);
            await interaction.reply(`${interaction.user} Horário adicionado com sucesso! (${infosInputs})`);
            await mostrarHorarios(interaction.channel);
        });
    }
}