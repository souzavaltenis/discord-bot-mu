import { ConfigBot } from "../config-bot";
import { IBotConfigBot } from "../interface/config-bot/bot-config-bot";
import { ICargosConfigBot } from "../interface/config-bot/cargos-config-bot";
import { IChannelsConfigBot } from "../interface/config-bot/channels-config-bot";
import { ICollectionsConfigBot } from "../interface/config-bot/collections-config-bot";
import { IDocumentsConfigBot } from "../interface/config-bot/documents-config-bot";
import { IGeralConfigBot } from "../interface/config-bot/geral-config-bot";
import { IKafkaConfigBot } from "../interface/config-bot/kafka-config-bot";
import { IMuConfigBot } from "../interface/config-bot/mu-config-bot";

export class ConfigBotSingleton {
    private static instance: ConfigBotSingleton;

    configBot: ConfigBot;

    constructor(configBot: ConfigBot) {
        this.configBot = configBot;
    }

    static getInstance(): ConfigBotSingleton {
        if (!this.instance) {
            this.instance = new this(new ConfigBot(
                {} as IBotConfigBot,
                {} as ICargosConfigBot,
                {} as IChannelsConfigBot,
                {} as ICollectionsConfigBot,
                [],
                {} as IDocumentsConfigBot,
                {} as IGeralConfigBot,
                {} as IMuConfigBot,
                {} as IKafkaConfigBot,
                '',
                [],
                new Map<string, boolean>()
            ));
        }
        return this.instance;
    }
}