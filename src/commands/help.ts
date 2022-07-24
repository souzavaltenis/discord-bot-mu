import { bold, SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export class Help {
    data = new SlashCommandBuilder()
        .setName('help')
        .setDescription('Veja como me utilizar');

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {

        const strComandos: string = `\u200B\n` +
            `${bold('/add')} Anota um horário com formulário\n` +
            `${bold('/anotar')} Anota um horário sem formulário\n` +
            `${bold('/list')} Exibe a tabela com todos horários\n` +
            `${bold('/reset geral')} Reseta todos horários de todas salas\n` +
            `${bold('/reset sala')} Reseta todos horários de uma sala específica\n` +
            `${bold('/config horario')} Defina o intervalo inicial e final dos boss \n` +
            `${bold('/sala adicionar')} Adiciona uma nova sala\n` +
            `${bold('/sala remover')} Remove uma sala existente\n` +
            `${bold('/help')} Exibe essa ajuda\n\u200B`;

        const strIcones: string = '\u200B\n✅ aberto\n❌ vencido\n💤 irá abrir\n\u200B';

        const strBotoes: string = '\u200B\n' +
            `${bold('🔥 Todos')}: Visão dos horários por boss\n` +
            `${bold('💢 Salas')}: Visão dos horários por cada sala\n` +
            `${bold('⏭ Próximos')}: Exibe os boss próximos de abrir/fechar\n` +
            `${bold('🏆 Rank')}: Rank Top 10 Geral, Semanal e Diário de quem está anotando horários\n` +
            `${bold('💾 Histórico')}: Histórico da tabela nas últimas 24hrs com intervalo de 1hr\n\u200B`;

        const embedHelp = new EmbedBuilder()
            .setColor('Grey')
            .addFields([
                { name: '⚙ Comandos', value: strComandos},
                { name: 'Descrição Ícones', value: strIcones},
                { name: 'Descrição Botões Tabela', value: strBotoes}
            ]);

        await interaction.reply({
            embeds: [embedHelp],
            ephemeral: true
        });
    }
}