import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Ids } from "../models/ids";
import { getIdButton } from "./geral-utils";

const disableButton = (buttons: ButtonBuilder[], idToDisable: string): ActionRowBuilder<ButtonBuilder> => {
    buttons.forEach((button: ButtonBuilder) => {
        const isSelected: boolean = getIdButton(button) === idToDisable 
            || (getIdButton(button) === Ids.BUTTON_TABLE_PROXIMOS 
            && [Ids.BUTTON_ABRIR_PROXIMOS, Ids.BUTTON_FECHAR_PROXIMOS, Ids.BUTTON_TABLE_PROXIMOS].includes(idToDisable));

        button.setDisabled(isSelected);
        button.setStyle(isSelected ? ButtonStyle.Primary : ButtonStyle.Secondary);
    });

    return new ActionRowBuilder<ButtonBuilder>().setComponents(buttons);
}

const disableButtonProximos = (buttons: ButtonBuilder[], idToDisable: string): ActionRowBuilder<ButtonBuilder> => {
    buttons.forEach((button: ButtonBuilder) => {
        const isSelected: boolean = getIdButton(button) === idToDisable;
        button.setDisabled(isSelected);
    });

    return new ActionRowBuilder<ButtonBuilder>().setComponents(buttons);
}

export { disableButton, disableButtonProximos }