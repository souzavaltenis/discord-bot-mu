import { ConfigBot } from "../config-bot";

export class ConfigBotSingleton {
    private static instance: ConfigBotSingleton;

    configBot: ConfigBot | undefined;

    constructor(configBot?: ConfigBot) {
        this.configBot = configBot;
    }

    static getInstance(): ConfigBotSingleton {
        if (!this.instance) {
          this.instance = new this();
        }
        return this.instance;
    }
}