import { ModalActionRowComponent, MessageActionRow, Modal, TextInputComponent, ModalSubmitInteraction } from 'discord.js';
import { Ids } from '../utils/ids';
import { adicionarHorarioBoss } from '../utils/db';
import { BossDAO } from '../entities/boss-dao';
import { mostrarHorarios } from './tabela-horario-boss';

export class AdicionarHorarioModal {

    getModal(): Modal {
        const modalHorarioBoss = new Modal()
            .setCustomId(Ids.MODAL_ADICIONAR_HORARIO_BOSS)
            .setTitle('Adicionar Horário de Boss');

        const inputNomeBoss = new TextInputComponent()
            .setCustomId(Ids.INPUT_NOME_BOSS)
            .setLabel("Qual boss?")
            .setPlaceholder("Ex: rei, fenix, relics")
            .setRequired(true)
            .setStyle('SHORT');
        
        const inputSalaBoss = new TextInputComponent()
            .setCustomId(Ids.INPUT_SALA_BOSS)
            .setLabel("Qual sala?")
            .setPlaceholder("Ex: 3")
            .setRequired(true)
            .setStyle('SHORT');

        const inputHorarioBoss = new TextInputComponent()
            .setCustomId(Ids.INPUT_HORARIO_BOSS)
            .setLabel("Qual horário?")
            .setPlaceholder("Ex: 21:45, 02:34")
            .setRequired(true)
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
        const valoresRelics = ['relics', 'illusion', 'relycs', 'illusion of kundun'];
        const valoresFenix = ['fenix', 'phoenix', 'phoenix of darkness'];

        switch (true) {
            case valoresRei.includes(textInputNomeBoss): nomeBoss = "rei"; break;
            case valoresRelics.includes(textInputNomeBoss): nomeBoss = "relics"; break;
            case valoresFenix.includes(textInputNomeBoss): nomeBoss = "fenix"; break;
        }

        if (!nomeBoss) {
            await interaction.reply(`Boss ${textInputNomeBoss} não reconhecido!`);
            return;
        }

        const textInputSalaBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_SALA_BOSS);
        
        const salaBoss = parseInt(textInputSalaBoss);

        if (salaBoss === NaN || ![2, 3, 4, 5, 6].includes(salaBoss)) {
            await interaction.reply(`Sala ${textInputSalaBoss} não reconhecida!`);
            return;
        }

        const textInputHorarioBoss: string = interaction.fields.getTextInputValue(Ids.INPUT_HORARIO_BOSS);

        if (!(/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/).test(textInputHorarioBoss)) {
            await interaction.reply(`Horário ${textInputHorarioBoss} não reconhecido!`);
            return;
        }
        
        const bossDAO = new BossDAO(nomeBoss, salaBoss+'', textInputHorarioBoss);
        
        adicionarHorarioBoss(bossDAO).then(async () => {
            await interaction.reply(`Horário adicionado com sucesso! (Boss: ${bossDAO.nome} Sala: ${bossDAO.sala} Horário: ${bossDAO.horario})`);
            await mostrarHorarios(interaction.channel);
        });
    }
}