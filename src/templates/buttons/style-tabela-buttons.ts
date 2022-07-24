import { ButtonBuilder, ButtonStyle } from "discord.js";
import { Ids } from "../../models/ids";

const getButtonsTabela = (): ButtonBuilder[] => {

    const buttonTableBoss = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_TABLE_BOSS)
        .setEmoji('🔥')
        .setLabel('Todos')
        .setStyle(ButtonStyle.Secondary);

    const buttonTableSala = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_TABLE_SALA)
        .setEmoji('💢')
        .setLabel('Salas')
        .setStyle(ButtonStyle.Secondary);

    const buttonTableProximos = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_TABLE_PROXIMOS)
        .setEmoji('⏭')
        .setLabel('Próximos')
        .setStyle(ButtonStyle.Secondary);

    const buttonTableRank = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_TABLE_RANK)
        .setEmoji('🏆')
        .setLabel('Rank')
        .setStyle(ButtonStyle.Secondary);

    const buttonTableHistorico = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_TABLE_HISTORICO)
        .setEmoji('💾')
        .setLabel('Histórico')
        .setStyle(ButtonStyle.Secondary);

    return [buttonTableBoss, buttonTableSala, buttonTableProximos, buttonTableRank, buttonTableHistorico];
}

export { getButtonsTabela }