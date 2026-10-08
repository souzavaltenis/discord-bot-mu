import { ActionRowBuilder, ModalBuilder, TextInputBuilder, ModalSubmitInteraction, TextInputStyle, ModalActionRowComponentBuilder } from 'discord.js';
import { Ids } from '../../models/ids';
import { getNickMember } from '../../utils/geral-utils';
import { IGanhador } from '../../models/interface/ganhador-interface';
import { getEmbedResultadoSorteio } from '../embeds/resultado-sorteio-embed';
import { Sorteio } from '../../models/sorteio';
import { salvarSorteio } from '../../db/db';
import { Random, nodeCrypto } from 'random-js';

const random = new Random(nodeCrypto);

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
        const participantes: string[] = modalInteraction.fields
            .getTextInputValue(Ids.INPUT_PARTICIPANTES_SORTEIO)
            .split(/\r?\n/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        const premios: string[] = modalInteraction.fields
            .getTextInputValue(Ids.INPUT_PREMIOS_SORTEIO)
            .split(/\r?\n/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        if (participantes.length === 0) {
            await modalInteraction.reply({
                content: '❌ É necessário informar pelo menos 1 participante para realizar o sorteio.',
            });
            return;
        }

        if (premios.length === 0) {
            await modalInteraction.reply({
                content: '❌ É necessário informar pelo menos 1 item/prêmio para realizar o sorteio.',
            });
            return;
        }

        if (premios.length > participantes.length) {
            await modalInteraction.reply({
                content: `❌ A quantidade de itens (${premios.length}) não pode ser maior do que a quantidade de participantes (${participantes.length}).`,
            });
            return;
        }

        const participantesComIndex = participantes.map((nome: string, index: number) => ({
            id: index,
            nome
        }));

        // Embaralhamento criptograficamente seguro via Fisher-Yates (random-js + nodeCrypto)
        const participantesEmbaralhados = random.shuffle([...participantesComIndex]);

        // Sorteia X participantes baseado na quantidade X de itens
        const ganhadores: IGanhador[] = premios.map((premio: string, index: number) => {
            const sorteado = participantesEmbaralhados[index];
            return {
                id: sorteado.id,
                nome: sorteado.nome,
                premio: premio
            };
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