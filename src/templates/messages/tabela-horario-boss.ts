import { Message, ActionRowBuilder, ButtonBuilder, TextBasedChannel } from "discord.js";
import { Boss } from "../../models/boss";
import { consultarHorarioBoss, sincronizarConfigsBot } from "../../db/db";
import { agendarAvisos } from "../../utils/avisos-utils";
import { Ids } from "../../models/ids";
import { getEmbedTabelaBoss } from "../embeds/tabela-boss-embed";
import { getButtonsTabela } from "../buttons/style-tabela-buttons";
import { disableButton } from "../../utils/buttons-utils";
import { config } from "../../config/get-configs";
import { limparIntervalUpdate } from "../../utils/geral-utils";
import { ListBossSingleton } from "../../models/singleton/list-boss-singleton";

const mostrarHorarios = async (textChannel: TextBasedChannel | undefined | null) => {
    if (!textChannel?.isSendable()) {
        return;
    }

    await consultarHorarioBoss().then(async (listaBoss: Boss[]) => {

        ListBossSingleton.getInstance().boss = listaBoss;

        agendarAvisos(listaBoss);
        
        const buttons: ButtonBuilder[] = getButtonsTabela();

        const rowButtons: ActionRowBuilder<ButtonBuilder>[] = disableButton(buttons, Ids.BUTTON_TABLE_BOSS);

        await textChannel?.send({
            content: '\u200b\n'.repeat(10),
            embeds: [getEmbedTabelaBoss(listaBoss)],
            components: buttons.length > 0 ? [...rowButtons] : undefined
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
        });
    });
}

export { mostrarHorarios };