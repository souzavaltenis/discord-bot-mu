import { Guild } from "discord.js";
import { config } from "../config/get-configs";
import { getLogsGeralString } from "../utils/geral-utils";
import { clientRabbitMQ } from "../services/rabbitmq/client-rabbitmq";

export = {
    name: 'guildCreate',
    execute: async (guild: Guild) => {
        await clientRabbitMQ.produceMessage(config().rabbitmq.routingKeys.logsGeral, getLogsGeralString({ guild: guild }));
    }
}