import { MessageButton } from "discord.js";
import { Ids } from "../../models/ids";

const getButtonsTabela = (): MessageButton[] => {

    const buttonTableBoss = new MessageButton()
        .setCustomId(Ids.BUTTON_TABLE_BOSS)
        .setLabel('Todos')
        .setStyle('SECONDARY');

    const buttonTableAbertos = new MessageButton()
        .setCustomId(Ids.BUTTON_TABLE_ABERTOS)
        .setLabel('Abertos')
        .setStyle('SECONDARY');

    const buttonTableProximos = new MessageButton()
        .setCustomId(Ids.BUTTON_TABLE_PROXIMOS)
        .setLabel('Próximos')
        .setStyle('SECONDARY');

    const buttonTableSala = new MessageButton()
        .setCustomId(Ids.BUTTON_TABLE_SALA)
        .setLabel('Salas')
        .setStyle('SECONDARY');

    return [buttonTableBoss, buttonTableAbertos, buttonTableProximos, buttonTableSala];
}

export { getButtonsTabela }