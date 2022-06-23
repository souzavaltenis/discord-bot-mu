import { bold, SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';

export class Help {
    data = new SlashCommandBuilder()
        .setName('help')
        .setDescription('Veja como me utilizar');

    async execute(interaction: CommandInteraction): Promise<void> {

        const strComandos: string = `\u200B\n` +
            `${bold('/add')} Anota um horário com formulário\n\n` +
            `${bold('/anotar')} Anota um horário sem formulário\n\n` +
            `${bold('/list')} Exibe a tabela com todos horários\n\n` +
            `${bold('/reset geral')} Reseta todos horários de todas salas\n\n` +
            `${bold('/reset sala')} Reseta todos horários de uma sala específica\n\n` +
            `${bold('/help')} Exibe essa ajuda\n\u200B`;

        const embedHelp = new MessageEmbed()
            .setColor('GREY')
            .addField('⚙ Comandos', strComandos)
            .addField('Descrição Ícones', '\u200B\n✅ aberto\n\n❌ vencido\n\n💤 irá abrir\n\u200B')
            .addField('Descrição Botões Tabela', `\u200B\n` +
                `${bold('[Todos]')}: Visão dos horários por boss\n\n` +
                `${bold('[Salas]')}: Visão dos horários por cada sala\n\n` +
                `${bold('[Próximos]')}: Exibe os boss que irão abrir ordenados pelo tempo restante\n\n` +
                `${bold('[🏆]')}: Rank Top 10 Geral, Semanal e Diário de quem está anotando horários`);

        await interaction.reply({
            embeds: [embedHelp],
            ephemeral: true
        });
    }
}