import { Message } from "discord.js";

export class LastMessageSingleton {
    private static instance: LastMessageSingleton;

    lastMessage: Message | undefined;

    constructor(lastMessage?: Message) {
        this.lastMessage = lastMessage;
    }

    static getInstance(): LastMessageSingleton {
        if (!this.instance) {
          this.instance = new this();
        }
        return this.instance;
    }
}