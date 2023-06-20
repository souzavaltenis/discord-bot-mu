import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder, Message, StringSelectMenuBuilder } from "discord.js";
import { Boss } from "../models/boss";
import { config } from "../config/get-configs";
import { consultarBackupsListaBoss } from "../db/db";
import { Ids } from "../models/ids";
import { intervalUpdate } from "../models/singleton/interval-singleton";
import { ListBossSingleton } from "../models/singleton/list-boss-singleton";
import { backupsBossSingleton } from "../models/singleton/lista-backup-singleton";
import { sendMessageKafka } from "../services/kafka/kafka-producer";
import { getButtonsProximos } from "../templates/buttons/proximos-buttons";
import { getButtonsTabela } from "../templates/buttons/style-tabela-buttons";
import { getEmbedAvisoHistorico } from "../templates/embeds/aviso-historico-embed";
import { getEmbedTabelaBoss } from "../templates/embeds/tabela-boss-embed";
import { getEmbedTabelaProximos } from "../templates/embeds/tabela-proximos-embed";
import { getEmbedTabelaRank } from "../templates/embeds/tabela-rank-embed";
import { getEmbedTabelaVencidos } from "../templates/embeds/tabela-vencidos-embed";
import { AdicionarHorarioModal } from "../templates/modals/adicionar-horario-modal";
import { getSelectMenuBackup } from "../templates/selects/backups-selects";
import { disableSubButton, disableButton } from "../utils/buttons-utils";
import { getLogsGeralString, limparIntervalUpdate } from "../utils/geral-utils";

export = {
    name: 'ButtonInteraction',
    action: async (interaction: ButtonInteraction): Promise<void> => {
        const listaBoss: Boss[] = ListBossSingleton.getInstance().boss;
        const buttons: ButtonBuilder[] = getButtonsTabela();

        if (interaction.customId !== Ids.BUTTON_TABLE_ADD_HORARIO) {
            await interaction.deferUpdate();
        }
        
        sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ msgInteraction: interaction }));

        let embedSelecionada: EmbedBuilder | undefined;
        const rowButtons: ActionRowBuilder<ButtonBuilder>[] = [];
        const rowSelects: ActionRowBuilder<StringSelectMenuBuilder>[] = []
        const contentSpaces: string = '\u200b\n'.repeat(interaction.customId === Ids.BUTTON_TABLE_BOSS ? 10 : 40);

        limparIntervalUpdate();

        let isProximoAbrir: boolean | undefined;

        switch(interaction.customId) {
            // Button Todos
            case Ids.BUTTON_TABLE_BOSS: 
                embedSelecionada = getEmbedTabelaBoss(listaBoss);
                break;

            // Button Vencidos
            case Ids.BUTTON_TABLE_VENCIDOS: 
                embedSelecionada = getEmbedTabelaVencidos(listaBoss); 
                break;

            // Button Proximos
            case Ids.BUTTON_TABLE_PROXIMOS:
            case Ids.BUTTON_ABRIR_PROXIMOS:
            case Ids.BUTTON_FECHAR_PROXIMOS:
                const initButtonProximos: string = Ids.BUTTON_FECHAR_PROXIMOS;
                const idButtonProximos: string = interaction.customId === Ids.BUTTON_TABLE_PROXIMOS ? initButtonProximos : interaction.customId;
                const isAbrir: boolean = [Ids.BUTTON_TABLE_PROXIMOS, Ids.BUTTON_ABRIR_PROXIMOS].includes(idButtonProximos);
                isProximoAbrir = isAbrir;

                embedSelecionada = getEmbedTabelaProximos(isAbrir, listaBoss);
                rowButtons.push(disableSubButton(getButtonsProximos(), idButtonProximos));
                break;
            
            // Button Rank
            case Ids.BUTTON_TABLE_RANK:
            // case Ids.BUTTON_TABLE_RANK_NEW:
            // case Ids.BUTTON_TABLE_RANK_OLD:
                // const initButtonRank: string = Ids.BUTTON_TABLE_RANK_NEW;
                // const idButtonRank: string = interactionMessage.customId === Ids.BUTTON_TABLE_RANK ? initButtonRank : interactionMessage.customId;
                // const isNewRank: boolean = [Ids.BUTTON_TABLE_RANK, Ids.BUTTON_TABLE_RANK_NEW].includes(idButtonRank);
                // embedSelecionada = getEmbedTabelaRank(isNewRank); 
                embedSelecionada = getEmbedTabelaRank(); 
                // rowButtons.push(disableSubButton(getButtonsRank(), idButtonRank));
                break;

            // Button Histórico
            case Ids.BUTTON_TABLE_HISTORICO:
                embedSelecionada = getEmbedAvisoHistorico();
                backupsBossSingleton.backups = await consultarBackupsListaBoss();
                rowSelects.push(getSelectMenuBackup(backupsBossSingleton.backups));
                break;
            
            // Button Adicionar
            case Ids.BUTTON_TABLE_ADD_HORARIO:
                embedSelecionada = getEmbedTabelaBoss(listaBoss);
                interaction.showModal(new AdicionarHorarioModal().getModal());
                break;
        }

        rowButtons.push(...disableButton(buttons, interaction.customId));

        await interaction.message.edit({
            content: contentSpaces,
            embeds: embedSelecionada ? [embedSelecionada] : [], 
            components: buttons.length > 0 ? [...rowSelects, ...rowButtons] : undefined
        }).then(async (message: Message) => {
            if (isProximoAbrir === undefined) {
                return;
            }

            intervalUpdate.intervalId = setInterval(async ()=> {
                await message.edit({ embeds: [getEmbedTabelaProximos(isProximoAbrir ?? false)] });
            }, 60 * 1000);
        });
    }
}