import { Interaction, Message, MessageButton, MessageComponentInteraction, MessageEmbed, TextBasedChannel } from "discord.js";
import { Boss } from "../../models/boss";
import { consultarHorarioBoss, sincronizarConfigsBot } from "../../db/db";
import { agendarAvisos } from "../../utils/avisos-utils";
import { Ids } from "../../models/ids";
import { getEmbedTabelaBoss } from "../embeds/tabela-boss-embed";
import { getEmbedTabelaSala } from "../embeds/tabela-sala-embed";
import { getButtonsTabela } from "../buttons/style-tabela-buttons";
import { disableButton } from "../../utils/buttons-utils";
import { getEmbedTabelaProximos } from "../embeds/tabela-proximos-embed";
import { sendMessageKafka } from "../../services/kafka/kafka-producer";
import { config } from "../../config/get-configs";
import { getLogsGeralString } from "../../utils/geral-utils";
import { getEmbedTabelaRank } from "../embeds/tabela-rank-embed";
import { ListBossSingleton } from "../../models/singleton/list-boss-singleton";

const mostrarHorarios = async (textChannel: TextBasedChannel | null) => {
    
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

                await sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ msgInteraction: interactionMessage }));

                let embedSelecionada: MessageEmbed;

                switch(interactionMessage.customId) {
                    case Ids.BUTTON_TABLE_SALA: embedSelecionada = getEmbedTabelaSala(listaBoss); break;
                    case Ids.BUTTON_TABLE_PROXIMOS: embedSelecionada = getEmbedTabelaProximos(listaBoss); break;
                    case Ids.BUTTON_TABLE_RANK: embedSelecionada = await getEmbedTabelaRank(); break;
                    default: embedSelecionada = getEmbedTabelaBoss(listaBoss); break;
                }
                
                message.edit({ embeds: [embedSelecionada], components: [disableButton(buttons, interactionMessage.customId)] });
                await interactionMessage.deferUpdate();
            });

        });
    });
}

export { mostrarHorarios };