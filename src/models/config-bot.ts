import { IBotConfigBot } from "./interface/config-bot/bot-config-bot";
import { ICargosConfigBot } from "./interface/config-bot/cargos-config-bot";
import { IChannelsConfigBot } from "./interface/config-bot/channels-config-bot";
import { ICollectionsConfigBot } from "./interface/config-bot/collections-config-bot";
import { IDocumentsConfigBot } from "./interface/config-bot/documents-config-bot";
import { IKafkaConfigBot } from "./interface/config-bot/kafka-config-bot";
import { IMuConfigBot } from "./interface/config-bot/mu-config-bot";

export class ConfigBot {
    constructor(
        public bot: IBotConfigBot, 
        public cargos: ICargosConfigBot, 
        public channels: IChannelsConfigBot, 
        public collections: ICollectionsConfigBot, 
        public documents: IDocumentsConfigBot, 
        public mu: IMuConfigBot, 
        public kafka: IKafkaConfigBot,
        public ownerId: string
    ) {
        this.bot = bot;
        this.cargos = cargos;
        this.channels = channels;
        this.collections = collections;
        this.documents = documents;
        this.mu = mu;
        this.kafka = kafka;
        this.ownerId = ownerId;
    }
}