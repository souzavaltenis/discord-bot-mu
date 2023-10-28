import { AutocompleteFocusedOption, AutocompleteInteraction } from "discord.js";
import { autoCompleteNicks } from "../utils/auto-complete-utils";

export = {
    name: 'AutocompleteInteraction',
    action: async (interaction: AutocompleteInteraction): Promise<void> => {
        const nameCommand: string = interaction.commandName ?? "";
        const nameSubCommand: string = interaction.options.getSubcommand() ?? "";
        const focused: AutocompleteFocusedOption = interaction.options.getFocused(true);
        const nameFieldInput: string = focused.name;
        const valueFieldInput: string = focused.value;

        if (nameCommand === "pt" && nameSubCommand === "remove" && nameFieldInput === "nick") {
            await autoCompleteNicks(interaction, valueFieldInput);
        }
    }
}