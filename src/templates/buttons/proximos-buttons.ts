import { MessageButton } from "discord.js";
import { Ids } from "../../models/ids";

const getButtonsProximos = (): MessageButton[] => {

    const buttonProximoAbrir = new MessageButton()
        .setCustomId(Ids.BUTTON_ABRIR_PROXIMOS)
        .setLabel('Vai Abrir')
        .setStyle('SUCCESS');

    const buttonProximoFechar = new MessageButton()
        .setCustomId(Ids.BUTTON_FECHAR_PROXIMOS)
        .setLabel('Vai Fechar')
        .setStyle('DANGER');

    return [buttonProximoAbrir, buttonProximoFechar];
}

export { getButtonsProximos }