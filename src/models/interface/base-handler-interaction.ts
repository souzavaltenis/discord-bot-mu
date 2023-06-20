import { Interaction } from "discord.js";

export interface IBaseHandlerInteraction {
    name: string;
    action: (interaction: Interaction) => Promise<void>;
}