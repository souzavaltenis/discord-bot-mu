import { Message } from "discord.js";
import { INickInfo } from "../models/interface/nick-info";
import { Usuario } from "../models/usuario";
import { usuariosSingleton } from "../models/singleton/usuarios-singleton";

async function verificarMensagemNick(message: Message): Promise<Message<boolean>> {
    const nick: string = message.content;

    let nickInfo: INickInfo | undefined;
    
    const usuarioPT: Usuario | undefined = usuariosSingleton.usuarios.find((u: Usuario) => {
        nickInfo = u.nicks.find((n: INickInfo) => n.nick.toLowerCase() === nick.toLowerCase());
        return nickInfo;
    });

    if (!nickInfo || !usuarioPT) {
        return await message.reply({ content: `[❌] \`${nick}\` não foi localizado na PT` });
    } else if (nickInfo.ativo) {
        return await message.reply({ content: `[✅] \`${nickInfo.nick}\` é o membro <@${usuarioPT.id}> da PT` });
    } else {
        return await message.reply({ content: `[❌] \`${nickInfo.nick}\` não é mais um membro da PT` });
    }
}

async function verificarMensagemUsuario(message: Message): Promise<Message<boolean>> {
    const idUsuario: string = message.content.match(/\<@(\d+)\>/)?.[1] || "";
    const usuarioPT: Usuario | undefined = usuariosSingleton.usuarios.find((u: Usuario) => u.id === idUsuario);

    if (!usuarioPT || (usuarioPT && !usuarioPT.nicks.filter(n => n.ativo).length)) {
        return await message.reply({ content: `[❌] <@${idUsuario}> não possui nicks cadastrados na PT` });
    }

    const nicksUsuario: string = usuarioPT.nicks
        .filter((n: INickInfo) => n.ativo)
        .map((n: INickInfo) => '- `' + n.nick + '`').join('\n');

    return await message.reply({ content: `[✅] <@${idUsuario}> possui os nicks:\n${nicksUsuario}` });
}

export {
    verificarMensagemNick,
    verificarMensagemUsuario
}