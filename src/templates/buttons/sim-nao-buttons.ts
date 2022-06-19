import { MessageButton } from "discord.js";
import { Ids } from "../../models/ids";

const getButtonsSimNao = (): MessageButton[] => {

    const buttonSimReset = new MessageButton()
        .setCustomId(Ids.BUTTON_SIM_RESET)
        .setEmoji('⚰')
        .setLabel('Sim')
        .setStyle('DANGER');

    const buttonNaoReset = new MessageButton()
        .setCustomId(Ids.BUTTON_NAO_RESET)
        .setEmoji('😓')
        .setLabel('Não')
        .setStyle('PRIMARY');

    return [buttonSimReset, buttonNaoReset];
}

export { getButtonsSimNao }