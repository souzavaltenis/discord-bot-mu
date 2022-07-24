import { MessageButton } from "discord.js";
import { Ids } from "../../models/ids";

const getButtonsTabela = (): MessageButton[] => {

    const buttonTableBoss = new MessageButton()
        .setCustomId(Ids.BUTTON_TABLE_BOSS)
        .setEmoji('🔥')
        .setLabel('Todos')
        .setStyle('SECONDARY');

    const buttonTableSala = new MessageButton()
        .setCustomId(Ids.BUTTON_TABLE_SALA)
        .setEmoji('💢')
        .setLabel('Salas')
        .setStyle('SECONDARY');

    const buttonTableProximos = new MessageButton()
        .setCustomId(Ids.BUTTON_TABLE_PROXIMOS)
        .setEmoji('⏭')
        .setLabel('Próximos')
        .setStyle('SECONDARY');

    const buttonTableRank = new MessageButton()
        .setCustomId(Ids.BUTTON_TABLE_RANK)
        .setEmoji('🏆')
        .setLabel('Rank')
        .setStyle('SECONDARY');

    const buttonTableHistorico = new MessageButton()
        .setCustomId(Ids.BUTTON_TABLE_HISTORICO)
        .setEmoji('💾')
        .setLabel('Histórico')
        .setStyle('SECONDARY');

    return [buttonTableBoss, buttonTableSala, buttonTableProximos, buttonTableRank, buttonTableHistorico];
}

export { getButtonsTabela }