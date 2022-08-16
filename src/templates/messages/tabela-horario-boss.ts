import { Interaction, Message, ActionRowBuilder, ButtonBuilder, MessageComponentInteraction, EmbedBuilder, SelectMenuInteraction, TextBasedChannel, SelectMenuBuilder } from "discord.js";
import { Boss } from "../../models/boss";
import { consultarBackupsListaBoss, consultarHorarioBoss, sincronizarConfigsBot } from "../../db/db";
import { agendarAvisos } from "../../utils/avisos-utils";
import { Ids } from "../../models/ids";
import { getEmbedTabelaBoss } from "../embeds/tabela-boss-embed";
import { getEmbedTabelaSala } from "../embeds/tabela-sala-embed";
import { getButtonsTabela } from "../buttons/style-tabela-buttons";
import { disableButton, disableButtonProximos } from "../../utils/buttons-utils";
import { getEmbedTabelaProximos } from "../embeds/tabela-proximos-embed";
import { sendMessageKafka } from "../../services/kafka/kafka-producer";
import { config } from "../../config/get-configs";
import { getLogsGeralString } from "../../utils/geral-utils";
import { getEmbedTabelaRank } from "../embeds/tabela-rank-embed";
import { ListBossSingleton } from "../../models/singleton/list-boss-singleton";
import { getButtonsProximos } from "../buttons/proximos-buttons";
import { BackupListaBoss } from "../../models/backup-lista-boss";
import { getSelectMenuBackup } from "../selects/backups-selects";
import { backupsBossSingleton } from "../../models/singleton/lista-backup-singleton";
import { getEmbedAvisoHistorico } from "../embeds/aviso-historico-embed";
import { autoUpdatesProximos, AutoUpdateUtil } from "../../utils/auto-update-utils";

const mostrarHorarios = async (textChannel: TextBasedChannel | undefined | null) => {
    
    await consultarHorarioBoss().then(async (listaBoss: Boss[]) => {

        ListBossSingleton.getInstance().boss = listaBoss;

        agendarAvisos(listaBoss);

        const buttons: ButtonBuilder[] = getButtonsTabela();
        const rowButtons: ActionRowBuilder<ButtonBuilder> = disableButton(buttons, Ids.BUTTON_TABLE_BOSS);

        await textChannel?.send({ embeds: [getEmbedTabelaBoss(listaBoss)], components: [rowButtons] }).then(async (message: Message) => {

            if (message.channelId === config().channels.textHorarios) {
                const idLastMessageBoss: string = config().geral.idLastMessageBoss;

                if (idLastMessageBoss) {
                    await textChannel.messages.fetch(idLastMessageBoss)
                        .then(async m => {
                            autoUpdatesProximos.get(m.id)?.stopAutoUpdateTableProximos();
                            autoUpdatesProximos.delete(m.id);
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
    autoUpdatesProximos.set(message.id, new AutoUpdateUtil(message.channelId, message.id));

    collectorButtons.on("collect", async (interactionMessage: MessageComponentInteraction) => {
        await interactionMessage.deferUpdate();
        sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ msgInteraction: interactionMessage }));

        let embedSelecionada: EmbedBuilder | undefined;
        const rowButtons: ActionRowBuilder<ButtonBuilder>[] = [];
        const rowSelects: ActionRowBuilder<SelectMenuBuilder>[] = [];

        autoUpdatesProximos.get(message.id)?.stopAutoUpdateTableProximos();

        switch(interactionMessage.customId) {
            // Button Todos
            case Ids.BUTTON_TABLE_BOSS: 
                embedSelecionada = getEmbedTabelaBoss(listaBoss); 
                break;

            // Button Salas
            case Ids.BUTTON_TABLE_SALA: 
                embedSelecionada = getEmbedTabelaSala(listaBoss); 
                break;

            // Button Proximos
            case Ids.BUTTON_TABLE_PROXIMOS:
            case Ids.BUTTON_ABRIR_PROXIMOS:
            case Ids.BUTTON_FECHAR_PROXIMOS:
                const idButtonProximos: string = interactionMessage.customId === Ids.BUTTON_TABLE_PROXIMOS ? Ids.BUTTON_ABRIR_PROXIMOS : interactionMessage.customId;
                const isAbrir: boolean = [Ids.BUTTON_TABLE_PROXIMOS, Ids.BUTTON_ABRIR_PROXIMOS].includes(idButtonProximos);

                embedSelecionada = getEmbedTabelaProximos(isAbrir, listaBoss);
                rowButtons.push(disableButtonProximos(getButtonsProximos(), idButtonProximos));

                autoUpdatesProximos.get(message.id)?.initAutoUpdateTableProximos();
                break;
            
            // Button Rank
            case Ids.BUTTON_TABLE_RANK:
                embedSelecionada = getEmbedTabelaRank(); 
                break;

            // Button Histórico
            case Ids.BUTTON_TABLE_HISTORICO:
                embedSelecionada = getEmbedAvisoHistorico();
                backupsBossSingleton.backups = await consultarBackupsListaBoss();
                rowSelects.push(getSelectMenuBackup(backupsBossSingleton.backups));
                break;
        }

        rowButtons.push(disableButton(buttons, interactionMessage.customId));

        message.edit({ 
            embeds: embedSelecionada ? [embedSelecionada] : [], 
            components: [...rowSelects, ...rowButtons] 
        });
    });
};

const configCollectorSelects = async (message: Message): Promise<void> => {
    const collectorSelects = message.createMessageComponentCollector({ filter: (i: Interaction) => i.isSelectMenu(), time: 1000 * 60 * 60 * 4 });

    collectorSelects.on("collect", async (interaction: SelectMenuInteraction) => {
        await interaction.deferUpdate();

        if (interaction.customId === Ids.SELECT_MENU_BACKUP) {
            const indexBackup: number = backupsBossSingleton.backups.findIndex(backup => backup.timestamp+'' === interaction.values[0]);
            if (indexBackup === -1) return;
    
            const backupSelecionado: BackupListaBoss = backupsBossSingleton.backups[indexBackup];
    
            message.edit({ embeds: [getEmbedTabelaBoss(backupSelecionado.listaBoss, backupSelecionado.timestamp)] });
        }
    });
}

export { mostrarHorarios };