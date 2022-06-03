import { MessageActionRow, MessageButton } from "discord.js";

const disableButton = (buttons: MessageButton[], idToDisable: string): MessageActionRow => {
    buttons.forEach((button: MessageButton) => {
        const isSelected: boolean = button.customId === idToDisable;
        button.setDisabled(isSelected);
        button.setStyle(isSelected ? 'PRIMARY' : 'SECONDARY');
    });

    return new MessageActionRow().setComponents(buttons);
}

export { disableButton }