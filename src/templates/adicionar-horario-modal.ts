import { ModalActionRowComponent, MessageActionRow, Modal, TextInputComponent, ModalSubmitInteraction } from 'discord.js';
import { Ids } from '../utils/ids';
import { adicionarHorarioBoss } from '../utils/db';
import { mostrarHorarios } from './tabela-horario-boss';

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
            .setStyle('SHORT');

        const inputDataBoss = new TextInputComponent()
            .setCustomId(Ids.INPUT_DATA_BOSS)
            .setLabel("Qual Data?")
            .setPlaceholder("Ex: 22/05")
            .setMinLength(5)
            .setMaxLength(5)
            .setStyle('SHORT');

        modalHorarioBoss.addComponents(
            new MessageActionRow<ModalActionRowComponent>().addComponents(inputNomeBoss),
            new MessageActionRow<ModalActionRowComponent>().addComponents(inputSalaBoss),
            new MessageActionRow<ModalActionRowComponent>().addComponents(inputHorarioBoss),
            new MessageActionRow<ModalActionRowComponent>().addComponents(inputDataBoss)
        );

        return modalHorarioBoss;
    }

    async action(interaction: ModalSubmitInteraction) {
        const textInputNomeBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_NOME_BOSS).toLocaleLowerCase();

        let nomeBoss = "";

        const valoresRei = ['rey', 'rei', 'rei kundun', 'reikundun', 'rey kundun', 'kundun'];
        const valoresRelics = ['relics', 'illusion', 'relycs', 'relcs', 'relic', 'illusion of kundun'];
        const valoresFenix = ['fenix', 'phoenix', 'fênix', 'fnix', 'fenx', 'phoenix of darkness'];
        const valoresDbk = ['dbk', 'death', 'beam,', 'dbl', 'deathbk', 'bk', 'death beam knigth'];

        switch (true) {
            case valoresRei.includes(textInputNomeBoss): nomeBoss = "rei"; break;
            case valoresRelics.includes(textInputNomeBoss): nomeBoss = "relics"; break;
            case valoresFenix.includes(textInputNomeBoss): nomeBoss = "fenix"; break;
            case valoresDbk.includes(textInputNomeBoss): nomeBoss = "dbk"; break;
        }

        if (!nomeBoss) {
            await interaction.reply(`${interaction.user} Boss ${textInputNomeBoss} não é reconhecido!`);
            return;
        }

        const textInputSalaBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_SALA_BOSS);
        
        const salaBoss = parseInt(textInputSalaBoss);
        const salasConhecidas = [2, 3, 4, 5, 6];

        if (salaBoss === NaN || !salasConhecidas.includes(salaBoss)) {
            await interaction.reply(`${interaction.user} Sala ${textInputSalaBoss} não é reconhecida! Use a sala 2, 3, 4, 5 ou 6.`);
            return;
        }

        const textInputHorarioBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_HORARIO_BOSS);

        if (textInputHorarioBoss && !(/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/).test(textInputHorarioBoss)) {
            await interaction.reply(`${interaction.user} Horário ${textInputHorarioBoss} não é reconhecido! Use como exemplo: 15:46`);
            return;
        }

        const textInputDataBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_DATA_BOSS);

        if (textInputDataBoss && !(/(3[01]|[12][0-9]|0[1-9])[\/](1[0-2]|0[1-9])/).test(textInputDataBoss)) {
            await interaction.reply(`${interaction.user} Data ${textInputHorarioBoss} não é reconhecida! Use como exemplo: 22/05`);
            return;
        }

        adicionarHorarioBoss(nomeBoss, textInputSalaBoss, textInputHorarioBoss, textInputDataBoss).then(async () => {
            await interaction.reply(`${interaction.user} Horário adicionado com sucesso! (boss: ${nomeBoss} sala: ${textInputSalaBoss} horário: ${textInputHorarioBoss} data: ${textInputDataBoss})`);
            await mostrarHorarios(interaction.channel);
        });
    }
}