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

        modalHorarioBoss.addComponents(
            new MessageActionRow<ModalActionRowComponent>().addComponents(inputNomeBoss),
            new MessageActionRow<ModalActionRowComponent>().addComponents(inputSalaBoss),
            new MessageActionRow<ModalActionRowComponent>().addComponents(inputHorarioBoss)
        );

        return modalHorarioBoss;
    }

    async action(interaction: ModalSubmitInteraction) {
        const textInputNomeBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_NOME_BOSS).toLocaleLowerCase();

        let nomeBoss = "";

        const valoresRei = ['rey', 'rei', 'rei kundun', 'reikundun', 'rey kundun', 'kundun'];
        const valoresRelics = ['relics', 'illusion', 'relycs', 'relcs', 'relic', 'illusion of kundun'];
        const valoresFenix = ['fenix', 'phoenix', 'fnix', 'fenx', 'phoenix of darkness'];
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
            await interaction.reply(`${interaction.user} Sala ${textInputSalaBoss} não é reconhecida!`);
            return;
        }

        const textInputHorarioBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_HORARIO_BOSS);
        
        adicionarHorarioBoss(nomeBoss, textInputSalaBoss, textInputHorarioBoss).then(async () => {
            await interaction.reply(`${interaction.user} Horário adicionado com sucesso! (boss: ${nomeBoss} sala: ${textInputSalaBoss} horário: ${textInputHorarioBoss})`);
            await mostrarHorarios(interaction.channel);
        });
    }
}