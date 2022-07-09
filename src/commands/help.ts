import { bold, SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';

export class Help {
    data = new SlashCommandBuilder()
        .setName('help')
        .setDescription('Veja como me utilizar');

    async execute(interaction: CommandInteraction): Promise<void> {

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
            `${bold('[Todos]')}: Visão dos horários por boss\n` +
            `${bold('[Salas]')}: Visão dos horários por cada sala\n` +
            `${bold('[Próximos]')}: Exibe os boss que irão abrir ordenados pelo tempo restante\n` +
            `${bold('[🏆]')}: Rank Top 10 Geral, Semanal e Diário de quem está anotando horários\n\u200B`;

        const embedHelp = new MessageEmbed()
            .setColor('GREY')
            .addField('⚙ Comandos', strComandos)
            .addField('Descrição Ícones', strIcones)
            .addField('Descrição Botões Tabela', strBotoes);

        await interaction.reply({
            embeds: [embedHelp],
            ephemeral: true
        });
    }
}