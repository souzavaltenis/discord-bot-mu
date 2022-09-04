import { Guild } from "discord.js";
import { config } from "../config/get-configs";
import { sendMessageKafka } from "../services/kafka/kafka-producer";
import { getLogsGeralString } from "../utils/geral-utils";

export = {
    name: 'guildCreate',
    execute: async (guild: Guild) => {
        await sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ guild: guild }));
    }
}