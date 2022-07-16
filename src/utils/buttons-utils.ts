import { MessageActionRow, MessageButton } from "discord.js";
import { Ids } from "../models/ids";

const disableButton = (buttons: MessageButton[], idToDisable: string): MessageActionRow => {
    buttons.forEach((button: MessageButton) => {
        const isSelected: boolean = button.customId === idToDisable 
            || (button.customId === Ids.BUTTON_TABLE_PROXIMOS 
            && [Ids.BUTTON_ABRIR_PROXIMOS, Ids.BUTTON_FECHAR_PROXIMOS, Ids.BUTTON_TABLE_PROXIMOS].includes(idToDisable));

        button.setDisabled(isSelected);
        button.setStyle(isSelected ? 'PRIMARY' : 'SECONDARY');
    });

    return new MessageActionRow().setComponents(buttons);
}

const disableButtonProximos = (buttons: MessageButton[], idToDisable: string): MessageActionRow => {
    buttons.forEach((button: MessageButton) => {
        const isSelected: boolean = button.customId === idToDisable;
        button.setDisabled(isSelected);
    });

    return new MessageActionRow().setComponents(buttons);
}

export { disableButton, disableButtonProximos }