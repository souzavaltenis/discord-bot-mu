import { codeBlock } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";

const getEmbedAlertaErro = (err: Error): EmbedBuilder => {
    const embedAlertaErro = new EmbedBuilder()
        .setColor("DarkRed")
        .setTitle("❌ ERROR")
        .setDescription("\u200B")
        .addFields([{ name: "Stack", value: err.stack ? codeBlock("json", err.stack.slice(0, 1000)) : "\u200B" }])
        .setTimestamp();

    return embedAlertaErro;
}

export { getEmbedAlertaErro }