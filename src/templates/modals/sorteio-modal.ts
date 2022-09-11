import { ActionRowBuilder, ModalBuilder, TextInputBuilder, ModalSubmitInteraction, TextInputStyle, ModalActionRowComponentBuilder } from 'discord.js';
import { Ids } from '../../models/ids';
import { getNickMember, getRandomNumber } from '../../utils/geral-utils';
import { IGanhador } from '../../models/interface/ganhador-interface';
import { getEmbedResultadoSorteio } from '../embeds/resultado-sorteio-embed';
import { Sorteio } from '../../models/sorteio';
import { salvarSorteio } from '../../db/db';

export class SorteioModal {

    getModal(): ModalBuilder {
        const modalSorteio = new ModalBuilder()
            .setCustomId(Ids.MODAL_SORTEIO_DROPS)
            .setTitle('Sorteio de Itens');
        
        const participantesInput = new TextInputBuilder()
            .setCustomId(Ids.INPUT_PARTICIPANTES_SORTEIO)
            .setLabel("Participantes separados por [ENTER]")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

        const premiosInput = new TextInputBuilder()
            .setCustomId(Ids.INPUT_PREMIOS_SORTEIO)
            .setLabel("Premio(s) separados por [ENTER]")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

        modalSorteio.addComponents(
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(participantesInput),
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(premiosInput)
        );

        return modalSorteio;
    }

    async action(modalInteraction: ModalSubmitInteraction) {
        const participantes: string[] = modalInteraction.fields.getTextInputValue(Ids.INPUT_PARTICIPANTES_SORTEIO).split('\n').filter(p => p);
        const premios: string[] = modalInteraction.fields.getTextInputValue(Ids.INPUT_PREMIOS_SORTEIO).split('\n').filter(p => p);

        const ganhadores: IGanhador[] = [];

        premios.forEach((premio: string) => {
            const idInicial: number = 0;
            const idFinal: number = participantes.length -1;
            const idsGanhadores: number[] = ganhadores.map((g: IGanhador) => g.id);

            const idSorteado: number = getRandomNumber(idInicial, idFinal, idsGanhadores);

            ganhadores.push({
                id: idSorteado,
                nome: participantes[idSorteado],
                premio: premio
            });
        });

        const sorteio = new Sorteio(
            new Date().valueOf(), 
            participantes, 
            premios, 
            ganhadores, 
            getNickMember(modalInteraction)
        );

        await salvarSorteio(sorteio);
        await modalInteraction.reply({ embeds: [getEmbedResultadoSorteio(sorteio)] });
    }
}