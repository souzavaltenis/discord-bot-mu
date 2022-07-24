import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Ids } from "../../models/ids";

const getButtonsSimNaoSala = (): ActionRowBuilder<ButtonBuilder> => {

    const buttonSim = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_SIM_REMOVE_SALA)
        .setLabel('Sim')
        .setStyle(ButtonStyle.Danger);

    const buttonNao = new ButtonBuilder()
        .setCustomId(Ids.BUTTON_NAO_REMOVE_SALA)
        .setLabel('Não')
        .setStyle(ButtonStyle.Primary);

    return new ActionRowBuilder<ButtonBuilder>().setComponents([buttonSim, buttonNao]);
}

export { getButtonsSimNaoSala }