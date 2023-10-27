import { Message } from "discord.js";
import { config } from "../config/get-configs";
import { verificarMensagemNick, verificarMensagemUsuario } from "../utils/nick-utils";

export = {
    name: 'messageCreate',
    execute: async (message: Message): Promise<Message<boolean> | void> => {
        
        if (message.author.bot) return;

        if (message.channelId === config().channels.textInfoNickPT && message.content) {

            switch (true) {
                case /^[a-zA-Z_0-9]{4,10}$/.test(message.content):
                    return await verificarMensagemNick(message);
                
                case /^\<@\d+\>$/.test(message.content):
                    return await verificarMensagemUsuario(message);
            }
        }
    }
}