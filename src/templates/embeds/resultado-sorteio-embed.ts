import { EmbedBuilder } from "discord.js";
import { Sorteio } from "../../models/sorteio";

const getEmbedResultadoSorteio = (sorteio: Sorteio): EmbedBuilder => {
    return new EmbedBuilder()
        .setTitle(`Sorteio de __${sorteio.criador}__`)
        .setDescription('\u200B')
        .addFields(
            { name: '🧙‍♂️ Participantes', value: sorteio.participantes.reduce((acc, value) => acc + `\u200B\n - ${value}`, '') + '\n\u200B' },
            { name: '💰 Prêmio(s)', value: sorteio.premios.reduce((acc, value) => acc + `\u200B\n - ${value}`, '') + '\n\u200B' },
            { name: '🎉 Resultado', value: sorteio.ganhadores.reduce((acc, value) => acc + `\u200B\n - **${value.nome}** ganhou **${value.premio}**`, '') + '\n\u200B' }
        )
        .setColor('DarkBlue')
        .setTimestamp();
}

export {
    getEmbedResultadoSorteio
}