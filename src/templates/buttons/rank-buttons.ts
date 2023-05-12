import { ButtonBuilder, ButtonStyle } from "discord.js";
import { Ids } from "../../models/ids";

const getButtonsRank = (): ButtonBuilder[] => {

    const buttonNewRank = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_TABLE_RANK_NEW)
        .setEmoji('📌')
        .setLabel('Novo')
        .setStyle(ButtonStyle.Secondary);

    const buttonOldRank = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_TABLE_RANK_OLD)
        .setEmoji('⌛')
        .setLabel('Acessar Antigo')
        .setStyle(ButtonStyle.Secondary);

    return [buttonNewRank, buttonOldRank];
}

export { getButtonsRank }