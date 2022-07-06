import { MessageActionRow, MessageButton } from "discord.js";
import { Ids } from "../models/ids";

const disableButton = (buttons: MessageButton[], idToDisable: string): MessageActionRow => {
    buttons.forEach((button: MessageButton) => {
        const isSelected: boolean = button.customId === idToDisable;
        button.setDisabled(isSelected && idToDisable !== Ids.BUTTON_TABLE_PROXIMOS);
        button.setStyle(isSelected ? 'PRIMARY' : 'SECONDARY');
    });

    return new MessageActionRow().setComponents(buttons);
}

export { disableButton }