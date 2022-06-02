import { MessageActionRow, MessageButton } from "discord.js";

const disableButton = (buttons: MessageButton[], idToDisable: string): MessageActionRow => {
    buttons.forEach(b => b.setDisabled(b.customId === idToDisable));
    return new MessageActionRow().setComponents(buttons);
}

export { disableButton }