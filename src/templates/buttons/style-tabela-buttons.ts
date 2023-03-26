import { ButtonBuilder, ButtonStyle } from "discord.js";
import { config } from "../../config/get-configs";
import { Ids } from "../../models/ids";
import { getIdButton } from "../../utils/geral-utils";

const getButtonsTabela = (getAll?: boolean): ButtonBuilder[] => {

    const buttonTableBoss = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_TABLE_BOSS)
        .setEmoji('🔥')
        .setLabel('Todos')
        .setStyle(ButtonStyle.Secondary);

    const buttonTableVencidos = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_TABLE_VENCIDOS)
        .setEmoji('❌')
        .setLabel('Vencidos')
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

    const allButtons: ButtonBuilder[] = [buttonTableBoss, buttonTableVencidos, buttonTableProximos, buttonTableRank, buttonTableHistorico];

    return getAll
        ? allButtons
        : allButtons.filter((button: ButtonBuilder) => config().configButtons.get(getIdButton(button)));
}

export { getButtonsTabela }