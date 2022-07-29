import { EmbedBuilder } from "discord.js";
import { config } from "../config/get-configs";
import { client } from "../index";
import { getEmbedAlertaErro } from "../templates/embeds/alerta-erro-embed";

const listenerErrors = (): void => {
    process.on('unhandledRejection', async (err: Error) => await sendAlertError(err));
    process.on('uncaughtException', async (err: Error) => await sendAlertError(err));
}

const sendAlertError = async (err: Error): Promise<void> => {
    const user = await client.users.fetch(config().ownerId).catch((e) => {e});
    const embedAlertaErro: EmbedBuilder = getEmbedAlertaErro(err);
    await user?.send({ embeds: [embedAlertaErro] }).catch((e) => {e});
}

export { listenerErrors }