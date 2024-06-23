import { Guild } from "discord.js";
import { sendLogGeral } from "../utils/logs-utils";

export = {
    name: 'guildCreate',
    execute: (guild: Guild) => {
        sendLogGeral({ guild: guild });
    }
}