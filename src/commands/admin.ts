import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord-api-types/v9";
import { bold, ButtonBuilder, ChatInputCommandInteraction, codeBlock, EmbedBuilder, InteractionResponse, Message, TextChannel } from "discord.js";
import { client } from "../index";
import { config } from "../config/get-configs";
import { carregarConfiguracoes, sincronizarConfigsBot } from "../db/db";
import { Boss } from "../models/boss";
import { Ids } from "../models/ids";
import { ListBossSingleton } from "../models/singleton/list-boss-singleton";
import { TimeoutSingleton } from "../models/singleton/timeout-singleton";
import { getButtonsTabela } from "../templates/buttons/style-tabela-buttons";
import { getEmbedTabelaBoss } from "../templates/embeds/tabela-boss-embed";
import { autoUpdatesProximos } from "../utils/auto-update-utils";
import { disableButton } from "../utils/buttons-utils";
import { sendLogErroInput } from "../utils/geral-utils";

export = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('Comandos admin')
        .addSubcommand(subcommand => {
            subcommand.setName('say')
                .setDescription('Informe uma mensagem para enviar no canal de horários')
                .addStringOption(option => option.setName('msg').setDescription('.').setRequired(true));
            return subcommand;
        })
        .addSubcommand(subcommand => {
            subcommand.setName('aviso_footer')
                .setDescription('Informe uma aviso para aparecer no footer')
                .addStringOption(option => option.setName('msg_footer').setDescription('.'));
            return subcommand;
        })
        .addSubcommand(subcommand => {
            subcommand.setName('timeouts')
                .setDescription('Verifique os timeouts de avisos ativos');
            return subcommand;
        })
        .addSubcommand(subcommand => {
            subcommand.setName('refresh')
                .setDescription('Carrega as configurações mais atualizadas do banco de dados');
            return subcommand;
        }),
        
    execute: async (interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean> | undefined> => {
        if (interaction.user.id !== config().ownerId) {
            const msgErroPermissao: string = `${interaction.user} Você não pode utilizar esse comando`;
            await sendLogErroInput(interaction, msgErroPermissao);
            return await interaction.reply({ 
                content: msgErroPermissao,
                ephemeral: true
            });
        }

        const opcaoSubCommand = interaction.options.getSubcommand();

        switch(opcaoSubCommand) {
            case "say": await subCommandSay(interaction); break;
            case "aviso_footer": await subCommandAvisoFooter(interaction); break;
            case "timeouts": await subCommandTimeouts(interaction); break;
            case "refresh": await subCommandRefresh(interaction); break;
        }

        async function subCommandSay(interaction: ChatInputCommandInteraction): Promise<void> {
            const msg: string = interaction.options.getString('msg', true);
            const textChannel = client.channels.cache.get(config().channels.textHorarios) as TextChannel;
    
            if (!client || !textChannel) return;
    
            await textChannel.send({ content: msg.replace(/\\n/g, '\n') });
            await interaction.reply({ 
                content: `Mensagem ${codeBlock(msg)} foi enviada com sucesso no canal ${bold(textChannel.name)}`, 
                ephemeral: true 
            });
        }
    
        async function subCommandAvisoFooter(interaction: ChatInputCommandInteraction): Promise<void> {
            const msgFooter: string = interaction.options.getString('msg_footer') || '';
            const textChannel = client.channels.cache.get(config().channels.textHorarios) as TextChannel;
    
            config().mu.avisoFooter = msgFooter.replace(/\\n/g, '\u200B\n');
            await sincronizarConfigsBot();
    
            const idLastMessageBoss: string = config().geral.idLastMessageBoss;
    
            if (idLastMessageBoss) {
                const listaBoss: Boss[] = ListBossSingleton.getInstance().boss;
                if (listaBoss.length === 0) return;
    
                await textChannel.messages.fetch(idLastMessageBoss)
                    .then(async (m: Message) => {
                        const buttons: ButtonBuilder[] = getButtonsTabela();
                        const rowButtons = disableButton(buttons, Ids.BUTTON_TABLE_BOSS);
                        autoUpdatesProximos.get(m.id)?.stopAutoUpdateTableProximos();
                        await m.edit({ embeds: [getEmbedTabelaBoss(listaBoss)], components: [rowButtons] });
                    })
                    .catch(e => console.log(e));
            }
    
            await interaction.reply({
                content: `Aviso footer foi atualizado com sucesso para "${msgFooter}"`,
                ephemeral: true
            });
        }
    
        async function subCommandTimeouts(interaction: ChatInputCommandInteraction): Promise<void> {
            const keysTimeouts: string[] = Array.from(TimeoutSingleton.getInstance().timeouts.keys());
            let strTimeouts: string = '';
            
            keysTimeouts.forEach((key: string, index: number) => strTimeouts += `\n${bold(index + 1 + '')} - ${key}`)
    
            const embedTimeouts = new EmbedBuilder()
                .setTitle("Timeouts de avisos ativos")
                .setColor("White")
                .setDescription(strTimeouts || 'Sem avisos ativos no momento.')
                .setTimestamp();
    
            await interaction.reply({ 
                embeds: [embedTimeouts],
                ephemeral: true 
            });
        }
    
        async function subCommandRefresh(interaction: ChatInputCommandInteraction): Promise<void> {
            await carregarConfiguracoes();
            await interaction.reply({ 
                content: "As configurações mais atualizadas do banco de dados foram carregadas",
                ephemeral: true 
            });
        }
    }
}

