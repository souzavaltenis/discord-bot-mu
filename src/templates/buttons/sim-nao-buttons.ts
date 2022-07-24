import { ButtonBuilder, ButtonStyle } from "discord.js";
import { Ids } from "../../models/ids";

const getButtonsSimNao = (): ButtonBuilder[] => {

    const buttonSimReset = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_SIM_RESET)
        .setEmoji('⚰')
        .setLabel('Sim')
        .setStyle(ButtonStyle.Danger);

    const buttonNaoReset = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_NAO_RESET)
        .setEmoji('😓')
        .setLabel('Não')
        .setStyle(ButtonStyle.Primary);

    return [buttonSimReset, buttonNaoReset];
}

export { getButtonsSimNao }