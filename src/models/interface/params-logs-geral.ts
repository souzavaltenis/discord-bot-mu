import { Client, CommandInteraction, Guild, MessageComponentInteraction } from "discord.js";

export interface IParamsLogsGeral {
    cmdInteraction?: CommandInteraction;
    client?: Client<boolean>;
    msgInteraction?: MessageComponentInteraction;
    guild?: Guild;
}