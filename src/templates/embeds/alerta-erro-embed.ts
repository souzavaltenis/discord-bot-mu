import { codeBlock } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

const getEmbedAlertaErro = (err: Error): MessageEmbed => {
    const embedAlertaErro = new MessageEmbed()
        .setColor("DARK_RED")
        .setTitle("❌ ERROR")
        .setDescription("\u200B")
        .addField("Stack", err.stack ? codeBlock("json", err.stack.slice(0, 1000)) : "\u200B")
        .setTimestamp();

    return embedAlertaErro;
}

export { getEmbedAlertaErro }