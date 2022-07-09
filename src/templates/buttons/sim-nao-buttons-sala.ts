import { MessageActionRow, MessageButton } from "discord.js";
import { Ids } from "../../models/ids";

const getButtonsSimNaoSala = (): MessageActionRow => {

    const buttonSim = new MessageButton()
        .setCustomId(Ids.BUTTON_SIM_REMOVE_SALA)
        .setLabel('Sim')
        .setStyle('DANGER');

    const buttonNao = new MessageButton()
        .setCustomId(Ids.BUTTON_NAO_REMOVE_SALA)
        .setLabel('Não')
        .setStyle('PRIMARY');

    return new MessageActionRow().setComponents([buttonSim, buttonNao]);
}

export { getButtonsSimNaoSala }