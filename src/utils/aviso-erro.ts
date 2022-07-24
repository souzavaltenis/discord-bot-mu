import { EmbedBuilder } from "discord.js";
import { config } from "../config/get-configs";
import { client } from "../index";
import { getEmbedAlertaErro } from "../templates/embeds/alerta-erro-embed";

const listenerErrors = (): void => {
    process.on('unhandledRejection', async (err) => {
        if (!(err instanceof Error)) return;
        const user = await client.users.fetch(config().ownerId).catch((e) => {e});
        const embedAlertaErro: EmbedBuilder = getEmbedAlertaErro(err);
        await user?.send({ embeds: [embedAlertaErro] }).catch((e) => {e});
    });
}

export { listenerErrors }