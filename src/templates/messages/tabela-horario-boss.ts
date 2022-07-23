import { Interaction, Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed, TextBasedChannel } from "discord.js";
import { Boss } from "../../models/boss";
import { consultarHorarioBoss, sincronizarConfigsBot } from "../../db/db";
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
import { mainTextChannel } from "../../utils/channels-utils";
import { getButtonsProximos } from "../buttons/proximos-buttons";

const mostrarHorarios = async (channel?: TextBasedChannel | null) => {
    const textChannel = channel || mainTextChannel();
    
    await consultarHorarioBoss().then(async (listaBoss: Boss[]) => {

        ListBossSingleton.getInstance().boss = listaBoss;

        agendarAvisos(listaBoss);

        const buttons: MessageButton[] = getButtonsTabela();
        const rowButtons = disableButton(buttons, Ids.BUTTON_TABLE_BOSS);

        await textChannel?.send({ embeds: [getEmbedTabelaBoss(listaBoss)], components: [rowButtons] }).then(async (message: Message) => {

            if (message.channelId === config().channels.textHorarios) {
                const idLastMessageBoss: string = config().geral.idLastMessageBoss;

                if (idLastMessageBoss) {
                    await textChannel.messages.fetch(idLastMessageBoss)
                        .then(async m => await m.delete())
                        .catch(e => console.log(e));
                }

                config().geral.idLastMessageBoss = message.id;
                await sincronizarConfigsBot();
            }

            const collector = message.createMessageComponentCollector({ filter: (i: Interaction) => i.isButton(), time: 1000 * 60 * 60 * 4 });

            collector.on("collect", async (interactionMessage: MessageComponentInteraction) => {
                await interactionMessage.deferUpdate();
                sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ msgInteraction: interactionMessage }));

                let embedSelecionada: MessageEmbed;
                const rows: MessageActionRow[] = [];
                switch(interactionMessage.customId) {
                    case Ids.BUTTON_TABLE_SALA: embedSelecionada = getEmbedTabelaSala(listaBoss); break;

                    case Ids.BUTTON_TABLE_PROXIMOS:
                    case Ids.BUTTON_ABRIR_PROXIMOS:
                    case Ids.BUTTON_FECHAR_PROXIMOS:
                        const idButtonProximos: string = interactionMessage.customId === Ids.BUTTON_TABLE_PROXIMOS ? Ids.BUTTON_ABRIR_PROXIMOS : interactionMessage.customId;
                        embedSelecionada = getEmbedTabelaProximos(listaBoss, idButtonProximos);
                        rows.push(disableButtonProximos(getButtonsProximos(), idButtonProximos));
                        break;
                        
                    case Ids.BUTTON_TABLE_RANK: embedSelecionada = getEmbedTabelaRank(); break;
                    default: embedSelecionada = getEmbedTabelaBoss(listaBoss); break;
                }

                rows.push(disableButton(buttons, interactionMessage.customId));

                message.edit({ embeds: [embedSelecionada], components: rows });
            });

        });
    });
}

export { mostrarHorarios };