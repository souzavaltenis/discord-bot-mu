import { EmbedBuilder } from "discord.js";
import { IGanhador } from "../../models/interface/ganhador-interface";

const getEmbedResultadoSorteio = (criador: string, participantes: string[], premios: string[], ganhadores: IGanhador[]): EmbedBuilder => {
    return new EmbedBuilder()
        .setTitle(`Sorteio realizado por __${criador}__`)
        .setDescription('\u200B')
        .addFields(
            { name: '🧙‍♂️ Participantes', value: participantes.reduce((acc, value) => acc + `\u200B\n - ${value}`, '') + '\n\u200B' },
            { name: '💰 Prêmio(s)', value: premios.reduce((acc, value) => acc + `\u200B\n - ${value}`, '') + '\n\u200B' },
            { name: '🎉 Resultado', value: ganhadores.reduce((acc, value) => acc + `\u200B\n - **${value.nome}** ganhou **${value.premio}**`, '') + '\n\u200B' }
        )
        .setColor('DarkBlue')
        .setTimestamp();
}

export {
    getEmbedResultadoSorteio
}