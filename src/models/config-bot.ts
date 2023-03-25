import { IBotConfigBot } from "./interface/config-bot/bot-config-bot";
import { ICargosConfigBot } from "./interface/config-bot/cargos-config-bot";
import { IChannelsConfigBot } from "./interface/config-bot/channels-config-bot";
import { ICollectionsConfigBot } from "./interface/config-bot/collections-config-bot";
import { IDocumentsConfigBot } from "./interface/config-bot/documents-config-bot";
import { IGeralConfigBot } from "./interface/config-bot/geral-config-bot";
import { IKafkaConfigBot } from "./interface/config-bot/kafka-config-bot";
import { IMuConfigBot } from "./interface/config-bot/mu-config-bot";

export class ConfigBot {
    constructor(
        public bot: IBotConfigBot,
        public cargos: ICargosConfigBot,
        public channels: IChannelsConfigBot,
        public collections: ICollectionsConfigBot,
        public dicasFooter: string[],
        public documents: IDocumentsConfigBot,
        public geral: IGeralConfigBot,
        public mu: IMuConfigBot,
        public kafka: IKafkaConfigBot,
        public ownerId: string,
        public adminsIds: string[],
        public configButtons: Map<string, boolean>
    ) {
        this.bot = bot;
        this.cargos = cargos;
        this.channels = channels;
        this.collections = collections;
        this.dicasFooter = dicasFooter;
        this.documents = documents;
        this.mu = mu;
        this.kafka = kafka;
        this.ownerId = ownerId;
        this.adminsIds = adminsIds;
        this.configButtons = configButtons;
    }
}