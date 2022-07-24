import { ButtonBuilder, ButtonStyle } from "discord.js";
import { Ids } from "../../models/ids";

const getButtonsProximos = (): ButtonBuilder[] => {

    const buttonProximoAbrir = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_ABRIR_PROXIMOS)
        .setEmoji('✅')
        .setLabel('Vai Abrir')
        .setStyle(ButtonStyle.Success);

    const buttonProximoFechar = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_FECHAR_PROXIMOS)
        .setEmoji('🏴‍☠️')
        .setLabel('Vai Fechar')
        .setStyle(ButtonStyle.Danger);

    return [buttonProximoAbrir, buttonProximoFechar];
}

export { getButtonsProximos }