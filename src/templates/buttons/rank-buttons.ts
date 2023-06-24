import { ButtonBuilder, ButtonStyle } from "discord.js";
import { Ids } from "../../models/ids";

const getButtonsRank = (): ButtonBuilder[] => {

    const buttonRankAnotacoes = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_TABLE_RANK_ANOTACOES)
        .setEmoji('✏️')
        .setLabel('Anotacões')
        .setStyle(ButtonStyle.Secondary);

    const buttonRankOnline = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_TABLE_RANK_ONLINE)
        .setEmoji('⏳')
        .setLabel('Tempo Online')
        .setStyle(ButtonStyle.Secondary);

    return [buttonRankAnotacoes, buttonRankOnline];
}

export { getButtonsRank }