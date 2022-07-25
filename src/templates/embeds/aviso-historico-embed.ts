import { bold } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";

const getEmbedAvisoHistorico = (): EmbedBuilder => {
    return new EmbedBuilder()
        .setTitle("Aviso")
        .setColor("DarkGrey")
        .setDescription(
            `\nA lista abaixo possui os backups das últimas 24hrs com intervalo de 1hr.` + 
            `\nAo selecionar um backup, será mostrado o estado da tabela no momento escolhido.` +
            `\nLembrando que é apenas uma visualização, ${bold('os horários atuais não serão afetados')}.\n`
        );
}

export { getEmbedAvisoHistorico }