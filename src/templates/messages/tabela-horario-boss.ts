import { Interaction, Message, ActionRowBuilder, ButtonBuilder, MessageComponentInteraction, EmbedBuilder, TextBasedChannel, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import { Boss } from "../../models/boss";
import { consultarBackupsListaBoss, consultarHorarioBoss, sincronizarConfigsBot } from "../../db/db";
import { agendarAvisos } from "../../utils/avisos-utils";
import { Ids } from "../../models/ids";
import { getEmbedTabelaBoss } from "../embeds/tabela-boss-embed";
import { getButtonsTabela } from "../buttons/style-tabela-buttons";
import { disableButton, disableSubButton } from "../../utils/buttons-utils";
import { getEmbedTabelaProximos } from "../embeds/tabela-proximos-embed";
import { sendMessageKafka } from "../../services/kafka/kafka-producer";
import { config } from "../../config/get-configs";
import { getLogsGeralString, limparIntervalUpdate } from "../../utils/geral-utils";
import { getEmbedTabelaRank } from "../embeds/tabela-rank-embed";
import { ListBossSingleton } from "../../models/singleton/list-boss-singleton";
import { getButtonsProximos } from "../buttons/proximos-buttons";
import { BackupListaBoss } from "../../models/backup-lista-boss";
import { getSelectMenuBackup } from "../selects/backups-selects";
import { backupsBossSingleton } from "../../models/singleton/lista-backup-singleton";
import { getEmbedAvisoHistorico } from "../embeds/aviso-historico-embed";
import { getEmbedTabelaVencidos } from "../embeds/tabela-vencidos-embed";
import { intervalUpdate } from "../../models/singleton/interval-singleton";
import { getButtonsRank } from "../buttons/rank-buttons";

const mostrarHorarios = async (textChannel: TextBasedChannel | undefined | null) => {
    
    await consultarHorarioBoss().then(async (listaBoss: Boss[]) => {

        ListBossSingleton.getInstance().boss = listaBoss;

        agendarAvisos(listaBoss);
        
        const buttons: ButtonBuilder[] = getButtonsTabela();

        const rowButtons: ActionRowBuilder<ButtonBuilder> = disableButton(buttons, Ids.BUTTON_TABLE_BOSS);

        await textChannel?.send({
            content: '\u200b\n'.repeat(10),
            embeds: [getEmbedTabelaBoss(listaBoss)],
            components: buttons.length > 0 ? [rowButtons] : undefined
        }).then(async (message: Message) => {

            if (message.channelId === config().channels.textHorarios) {
                const idLastMessageBoss: string = config().geral.idLastMessageBoss;

                if (idLastMessageBoss) {
                    await textChannel.messages.fetch(idLastMessageBoss)
                        .then(async m => {
                            limparIntervalUpdate();
                            await m.delete();
                        })
                        .catch(e => console.log(e));
                }

                config().geral.idLastMessageBoss = message.id;
                await sincronizarConfigsBot();
            }

            configCollectorButtons(message, listaBoss, buttons);
            configCollectorSelects(message);
        });
    });
}

const configCollectorButtons = async (message: Message, listaBoss: Boss[], buttons: ButtonBuilder[]) => {
    const collectorButtons = message.createMessageComponentCollector({ filter: (i: Interaction) => i.isButton(), time: 1000 * 60 * 60 * 4 });

    collectorButtons.on("collect", async (interactionMessage: MessageComponentInteraction) => {
        await interactionMessage.deferUpdate();
        sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ msgInteraction: interactionMessage }));

        let embedSelecionada: EmbedBuilder | undefined;
        const rowButtons: ActionRowBuilder<ButtonBuilder>[] = [];
        const rowSelects: ActionRowBuilder<StringSelectMenuBuilder>[] = []
        const contentSpaces: string = '\u200b\n'.repeat(interactionMessage.customId === Ids.BUTTON_TABLE_BOSS ? 10 : 40);

        limparIntervalUpdate();

        let isProximoAbrir: boolean | undefined;

        switch(interactionMessage.customId) {
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
                const idButtonProximos: string = interactionMessage.customId === Ids.BUTTON_TABLE_PROXIMOS ? initButtonProximos : interactionMessage.customId;
                const isAbrir: boolean = [Ids.BUTTON_TABLE_PROXIMOS, Ids.BUTTON_ABRIR_PROXIMOS].includes(idButtonProximos);
                isProximoAbrir = isAbrir;

                embedSelecionada = getEmbedTabelaProximos(isAbrir, listaBoss);
                rowButtons.push(disableSubButton(getButtonsProximos(), idButtonProximos));
                break;
            
            // Button Rank
            case Ids.BUTTON_TABLE_RANK:
            case Ids.BUTTON_TABLE_RANK_NEW:
            case Ids.BUTTON_TABLE_RANK_OLD:
                const initButtonRank: string = Ids.BUTTON_TABLE_RANK_NEW;
                const idButtonRank: string = interactionMessage.customId === Ids.BUTTON_TABLE_RANK ? initButtonRank : interactionMessage.customId;
                const isNewRank: boolean = [Ids.BUTTON_TABLE_RANK, Ids.BUTTON_TABLE_RANK_NEW].includes(idButtonRank);
                embedSelecionada = getEmbedTabelaRank(isNewRank); 
                rowButtons.push(disableSubButton(getButtonsRank(), idButtonRank));
                break;

            // Button Histórico
            case Ids.BUTTON_TABLE_HISTORICO:
                embedSelecionada = getEmbedAvisoHistorico();
                backupsBossSingleton.backups = await consultarBackupsListaBoss();
                rowSelects.push(getSelectMenuBackup(backupsBossSingleton.backups));
                break;
        }

        rowButtons.push(disableButton(buttons, interactionMessage.customId));

        await message.edit({
            content: contentSpaces,
            embeds: embedSelecionada ? [embedSelecionada] : [], 
            components: buttons.length > 0 ? [...rowSelects, ...rowButtons] : undefined
        }).then(async (m: Message) => {
            await checkUpdateProximos(m, isProximoAbrir, 60)
        });
    });
};

const configCollectorSelects = async (message: Message): Promise<void> => {
    const collectorSelects = message.createMessageComponentCollector({ filter: (i: Interaction) => i.isStringSelectMenu(), time: 1000 * 60 * 60 * 4 });

    collectorSelects.on("collect", async (interaction: StringSelectMenuInteraction) => {
        await interaction.deferUpdate();

        if (interaction.customId === Ids.SELECT_MENU_BACKUP) {
            const indexBackup: number = backupsBossSingleton.backups.findIndex(backup => backup.timestamp+'' === interaction.values[0]);
            if (indexBackup === -1) return;
    
            const backupSelecionado: BackupListaBoss = backupsBossSingleton.backups[indexBackup];
    
            message.edit({ embeds: [getEmbedTabelaBoss(backupSelecionado.listaBoss, backupSelecionado.timestamp)] });
        }
    });
}

const checkUpdateProximos = async (message: Message, isAbrir: boolean | undefined, secondsInterval: number): Promise<void> => {
    if (isAbrir === undefined) return;

    intervalUpdate.intervalId = setInterval(async ()=> {
        await message.edit({ embeds: [getEmbedTabelaProximos(isAbrir)] });
    }, secondsInterval * 1000);
}

export { mostrarHorarios };