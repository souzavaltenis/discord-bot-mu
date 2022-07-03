import { Message } from "discord.js";

export class LastMessageSingleton {
    private static instance: LastMessageSingleton;

    lastMessage: Message | undefined;
    lastMessageAlert: Message | undefined;

    constructor(lastMessage?: Message, lastMessageAlert?: Message) {
        this.lastMessage = lastMessage;
        this.lastMessageAlert = lastMessageAlert;
    }

    static getInstance(): LastMessageSingleton {
        if (!this.instance) {
          this.instance = new this();
        }
        return this.instance;
    }
}