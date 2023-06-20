import { Interaction } from "discord.js";
import { IBaseHandlerInteraction } from "../models/interface/base-handler-interaction";
import { interactions } from "../models/singleton/interactions-singleton";

export = {
    name: 'interactionCreate',
    execute: async (interaction: Interaction) => {
        const nameInteraction: string = interaction.constructor.name;
        const interactionFound: IBaseHandlerInteraction | undefined = interactions.get(nameInteraction);

        interactionFound?.action(interaction);
    }
}