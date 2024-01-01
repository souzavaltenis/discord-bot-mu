import { Message } from "discord.js";
import { config } from "../config/get-configs";
import { verificarMensagemNick, verificarMensagemUsuario } from "../utils/nick-utils";

export = {
    name: 'messageCreate',
    execute: async (message: Message): Promise<Message<boolean> | void> => {
        
        if (message.author.bot || !message.content) return;

        switch (message.channelId) {
            case config().channels.textInfoNickPT:
                switch (true) {
                    case /^[a-zA-Z_0-9]{4,10}$/.test(message.content):
                        return await verificarMensagemNick(message);
                    
                    case /^\<@\d+\>$/.test(message.content):
                        return await verificarMensagemUsuario(message);

                    default:
                        return await message.reply({ content: `Envie apenas mensagem contendo nick válido ou @usuario do discord` });
                }

            case config().channels.textGerenciarNickPT:
                return await message.reply({ content: `Não envie mensagens aqui!\nUse apenas os comandos: \`/pt add\` ou \`/pt remove\`` });

        }

    }
}