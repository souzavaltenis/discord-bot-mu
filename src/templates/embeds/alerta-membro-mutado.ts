import { EmbedBuilder } from "discord.js";

const getEmbedAlertaMembroMutado = (): EmbedBuilder => {
    const description: string = `Você foi movido para **AFK** por ter se **mutado** ou **desativado o áudio**.`
        + `\nPara voltar, **desmute** o microfone ou **ative** o áudio.`;

    const embedAlertaMembroMutado = new EmbedBuilder()
        .setColor("Random")
        .setDescription(description)
        .setTimestamp();

    return embedAlertaMembroMutado;
}

export { getEmbedAlertaMembroMutado }