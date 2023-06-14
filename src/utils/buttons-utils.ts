import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Ids } from "../models/ids";
import { getIdButton } from "./geral-utils";

const disableButton = (buttons: ButtonBuilder[], idToDisable: string): ActionRowBuilder<ButtonBuilder> => {
    if (idToDisable === Ids.BUTTON_TABLE_ADD_HORARIO) {
        idToDisable = Ids.BUTTON_TABLE_BOSS;
    }

    buttons.forEach((button: ButtonBuilder) => {
        const idButton = getIdButton(button);

        if (idButton === Ids.BUTTON_TABLE_ADD_HORARIO) {
            return;
        }

        const isSelected: boolean = idButton === idToDisable 
            || (idButton === Ids.BUTTON_TABLE_PROXIMOS && [Ids.BUTTON_ABRIR_PROXIMOS, Ids.BUTTON_FECHAR_PROXIMOS, Ids.BUTTON_TABLE_PROXIMOS].includes(idToDisable))
            || (idButton === Ids.BUTTON_TABLE_RANK && [Ids.BUTTON_TABLE_RANK, Ids.BUTTON_TABLE_RANK_NEW, Ids.BUTTON_TABLE_RANK_OLD].includes(idToDisable));

        button.setDisabled(isSelected);
        button.setStyle(isSelected ? ButtonStyle.Primary : ButtonStyle.Secondary);
    });

    return new ActionRowBuilder<ButtonBuilder>().setComponents(buttons);
}

const disableSubButton = (buttons: ButtonBuilder[], idToDisable: string): ActionRowBuilder<ButtonBuilder> => {
    buttons.forEach((button: ButtonBuilder) => {
        const isSelected: boolean = getIdButton(button) === idToDisable;
        button.setDisabled(isSelected);
    });

    return new ActionRowBuilder<ButtonBuilder>().setComponents(buttons);
}

export {
    disableButton,
    disableSubButton
}