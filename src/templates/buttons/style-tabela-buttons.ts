import { MessageButton } from "discord.js";
import { Ids } from "../../models/ids";

const getButtonsTabela = (): MessageButton[] => {

    const buttonTableBoss = new MessageButton()
        .setCustomId(Ids.BUTTON_TABLE_BOSS)
        .setLabel('Todos')
        .setStyle('SECONDARY');

    const buttonTableSala = new MessageButton()
        .setCustomId(Ids.BUTTON_TABLE_SALA)
        .setLabel('Salas')
        .setStyle('SECONDARY');

    const buttonTableProximos = new MessageButton()
        .setCustomId(Ids.BUTTON_TABLE_PROXIMOS)
        .setLabel('Próximos')
        .setStyle('SECONDARY');

    const buttonTableRank = new MessageButton()
        .setCustomId(Ids.BUTTON_TABLE_RANK)
        .setEmoji('🏆')
        .setStyle('SECONDARY');

    return [buttonTableBoss, buttonTableSala, buttonTableProximos, buttonTableRank];
}

export { getButtonsTabela }