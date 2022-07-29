import { codeBlock } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";

const getEmbedAlertaErro = (err: Error): EmbedBuilder => {
    const embedAlertaErro = new EmbedBuilder()
        .setColor("DarkRed")
        .setTitle(`❌ ERROR | ${err.name}: ${err.message}`)
        .setDescription(err.stack ? codeBlock("json", err.stack.slice(0, 4000)) : "\u200B")
        .setTimestamp();

    return embedAlertaErro;
}

export { getEmbedAlertaErro }