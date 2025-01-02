/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord-api-types/v9";
import { ActionRowBuilder, APIButtonComponentWithCustomId, bold, ButtonBuilder, ChatInputCommandInteraction, codeBlock, Collection, EmbedBuilder, Guild, GuildMember, InteractionResponse, Message, OAuth2Guild, TextChannel, User, VoiceChannel } from "discord.js";
import { client } from "../index";
import { botIsProd, config } from "../config/get-configs";
import { adicionarHorarioBoss, carregarConfiguracoes, sincronizarConfigsBot } from "../db/db";
import { Boss } from "../models/boss";
import { Ids } from "../models/ids";
import { ListBossSingleton } from "../models/singleton/list-boss-singleton";
import { TimeoutSingleton } from "../models/singleton/timeout-singleton";
import { getButtonsTabela } from "../templates/buttons/style-tabela-buttons";
import { getEmbedTabelaBoss } from "../templates/embeds/tabela-boss-embed";
import { disableButton } from "../utils/buttons-utils";
import { getIdButton, getNickMember, limparIntervalUpdate } from "../utils/geral-utils";
import { CategoryCommand } from "../models/enum/category-command";
import { Moment } from "moment";
import { dataNowMoment, dataNowString, momentToString, stringToMoment, timestampToMoment } from "../utils/data-utils";
import { IBossInfoAdd } from "../models/interface/boss-info-add";
import { getEmbedAddBoss } from "../templates/embeds/adicionar-boss-embed";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";
import { mainTextChannel } from "../utils/channels-utils";
import { IGuildInfos } from "../models/interface/guild-infos";
import { getEmbedServidoresBot } from "../templates/embeds/servidores-bot-embed";
import { sendLogErroInput } from "../utils/logs-utils";

export = {
    category: CategoryCommand.ADM,
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
        })
        .addSubcommand(subcommand => {
            subcommand.setName('apagar-msgs')
                .setDescription('Delete mensagens de um canal')
                .addIntegerOption(option => option.setName('qtd_msgs').setDescription('Informe a quantidade').setRequired(true));
            return subcommand;
        })
        .addSubcommand(subcommand => {
            subcommand.setName('anotar')
                .setDescription('Adicione Horário de Boss!')
                .addStringOption(option => option.setName('horario').setDescription('Qual horário?').setRequired(true))
                .addStringOption(option => {
                    option
                    .setName('boss')
                    .setDescription('Qual Boss?')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Rei Kundun', value: config().documents.rei },
                        { name: 'Relics',     value: config().documents.relics },
                        { name: 'Fenix',      value: config().documents.fenix },
                        { name: 'Death Beam', value: config().documents.deathBeam },
                        { name: 'Genocider',  value: config().documents.geno },
                        { name: 'Hell Maine',  value: config().documents.hell }
                    );
        
                    return option;
                })
                .addNumberOption(option => {
                    option.setName('sala').setDescription('Qual sala?').setRequired(true);
        
                    config().mu.salasPermitidas.forEach((sala: number) => {
                        option.addChoices({ name: `Sala ${sala}`, value: sala});
                    });
        
                    return option;
                })
                .addStringOption(option => option.setName('foi_ontem').setDescription('Esse horário foi ontem?').addChoices({ name: 'Não', value: 'N' }, { name: 'Sim', value: 'S' }));
            
            return subcommand;
        })
        .addSubcommand(subcommand => {
            subcommand.setName('servidores')
                .setDescription('Exibe os servidores que estou presente');
            return subcommand;
        })
        .addSubcommand(subcommand => {
            subcommand.setName('botoes')
                .setDescription('Ativar/desativar botões na tabela de horários')
                .addStringOption(option => {
                    option
                        .setName('id_botao')
                        .setDescription('Qual botão?')
                        .setRequired(true);

                    const botoesTabelaHorarios: ButtonBuilder[] = getButtonsTabela(true);

                    botoesTabelaHorarios.forEach((botao: ButtonBuilder) => {
                        option.addChoices({ name: (botao.toJSON() as APIButtonComponentWithCustomId).label || '', value: getIdButton(botao) });
                    });

                    return option;
                })
                .addStringOption(option => {
                    option
                        .setName('acao_botao')
                        .setDescription('Qual ação?')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Ativar', value: 'S' },
                            { name: 'Desativar', value: 'N' }
                        );

                    return option;
                });
            
            return subcommand;
        })
        .addSubcommand(subcommand => {
            subcommand.setName('get-log')
                .setDescription('Gerar log dos dados atuais em memória')
                .addStringOption(option => {
                    option
                        .setName('tipo_log')
                        .setDescription('Qual tipo log?')
                        .setRequired(true)
                        .addChoices(
                            { name: 'usuarios-singleton', value: 'usuarios-singleton' },
                            { name: 'geral-singleton', value: 'geral-singleton' }
                        );

                    return option;
                })
                .addStringOption(option => {
                    option
                        .setName('extensao_arquivo')
                        .setDescription('Qual extensão do arquivo de log?')
                        .setRequired(true)
                        .addChoices(
                            { name: 'json', value: 'json' },
                            { name: 'txt', value: 'txt' }
                        );

                    return option;
                });
            
            return subcommand;
        })
        .addSubcommand(subcommand => {
            subcommand.setName('move_sala')
                .setDescription('Mover usuários entre salas')
                .addChannelOption(option => {
                    option
                        .setName('canal_atual')
                        .setDescription('Qual canal os usuários estão?')
                        .setRequired(true);

                    return option;
                })
                .addChannelOption(option => {
                    option
                        .setName('canal_destino')
                        .setDescription('Qual canal os usuários deverão ir?')
                        .setRequired(true);

                    return option;
                });
            
            return subcommand;
        })
        .addSubcommand(subcommand => {
            subcommand.setName('move_usuario')
                .setDescription('Mover usuário')
                .addUserOption(option => {
                    option
                        .setName('usuario')
                        .setDescription('Quem deseja mover?')
                        .setRequired(true);

                    return option;
                })
                .addChannelOption(option => {
                    option
                        .setName('canal_destino')
                        .setDescription('Qual canal o usuário irá?')
                        .setRequired(true);

                    return option;
                });
            
            return subcommand;
        }),
        
    execute: async (interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean> | undefined> => {
        if (!config().adminsIds.includes(interaction.user.id)) {
            const msgErroPermissao: string = `${interaction.user} Você não pode utilizar esse comando`;
            sendLogErroInput(interaction, msgErroPermissao);
            return await interaction.reply({ 
                content: msgErroPermissao,
                ephemeral: true
            });
        }

        const opcaoSubCommand: string = interaction.options.getSubcommand();

        switch(opcaoSubCommand) {
            case "say": await subCommandSay(interaction); break;
            case "aviso_footer": await subCommandAvisoFooter(interaction); break;
            case "timeouts": await subCommandTimeouts(interaction); break;
            case "refresh": await subCommandRefresh(interaction); break;
            case "apagar-msgs": await subCommandApagarMsgs(interaction); break;
            case "anotar": await subCommandAnotar(interaction); break;
            case "servidores": await subCommandServidores(interaction); break;
            case "botoes": await subCommandBotoes(interaction); break;
            case "get-log": await subCommandGetLog(interaction); break;
            case "move_sala": await subCommandMoveSala(interaction); break;
            case "move_usuario": await subCommandMoveUsuario(interaction); break;
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
                        const rowButtons: ActionRowBuilder<ButtonBuilder>[] = disableButton(buttons, Ids.BUTTON_TABLE_BOSS);
                        limparIntervalUpdate();
                        await m.edit({ embeds: [getEmbedTabelaBoss(listaBoss)], components: [...rowButtons] });
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
            await mostrarHorarios(mainTextChannel());
            await interaction.reply({ 
                content: "As configurações mais atualizadas do banco de dados foram carregadas",
                ephemeral: true 
            });
        }

        async function subCommandApagarMsgs(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean> | undefined> {

            const quantidade: number = interaction.options.getInteger('qtd_msgs', true);
        
            if (isNaN(quantidade) || quantidade < 0 || quantidade > 100) {
                return await interaction.reply("Informe uma quantidade entre 0 e 100");
            }
            
            if (!(interaction.channel instanceof TextChannel)) {
                return await interaction.reply("Tipo de canal não válido");
            }
    
            await interaction.channel.bulkDelete(quantidade, true)
                .then((x) => interaction.reply({ content: `${x.size} mensagens foram deletadas com sucesso`, ephemeral: true }))
                .catch(() => interaction.reply({ content: `Não foi possível deletar as mensagens`, ephemeral: true }));
        }

        async function subCommandAnotar(interaction: ChatInputCommandInteraction): Promise<void> {
            const horario: string = (interaction.options.getString('horario') || '').replace(';', ':');
            const bossDoc: string = interaction.options.getString('boss') || '';
            const salaBoss: number = interaction.options.getNumber('sala') || 0;
            const foiontem: string = interaction.options.getString('foi_ontem') || '';

            if (!(/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/).test(horario)) {
                const msgErroHorario: string = `${interaction.user} Horário (${bold(horario)}) não é reconhecido! Use como exemplo: 15:46`;
                sendLogErroInput(interaction, msgErroHorario);
                await interaction.reply({
                    content: msgErroHorario,
                    ephemeral: true
                });
                return;
            }

            const horarioMoment: Moment = stringToMoment(`${dataNowString('DD/MM/YYYY')} ${horario} -0300`)

            if (foiontem === 'S') {
                horarioMoment.subtract(1, 'day');
            }

            const bossInfo = {
                nomeDocBoss: bossDoc,
                salaBoss: salaBoss + '',
                horarioInformado: momentToString(horarioMoment),
                timestampAcao: dataNowMoment().valueOf()
            } as IBossInfoAdd;

            await adicionarHorarioBoss(bossInfo).then(async () => {
                const embedAddBoss: EmbedBuilder = getEmbedAddBoss(bossDoc, horarioMoment, salaBoss, getNickMember(interaction));
                await interaction.reply({ embeds: [embedAddBoss], ephemeral: true });
                await mostrarHorarios(mainTextChannel());
            });
        }

        async function subCommandServidores(interaction: ChatInputCommandInteraction): Promise<void> {
            const guildsOAuth: Collection<string, OAuth2Guild> = await client.guilds.fetch();
            const guildsIds: string[] = [...guildsOAuth.values()].map(g => g.id);

            const guilds: IGuildInfos[] = [];

            for (const guildId of guildsIds) {
                const guild: Guild = await client.guilds.fetch(guildId);
                const ownerGuild: User = await client.users.fetch(guild.ownerId);
                
                guilds.push({
                    nomeGuild: guild.name,
                    idGuild: guild.id,
                    quantidadeMembros: guild.memberCount,
                    dataEntradaBot: timestampToMoment(guild.joinedTimestamp),
                    nomeOwnerGuild: ownerGuild.tag,
                    idOwnerGuild: ownerGuild.id
                });
            }

            guilds.sort((a, b) => a.dataEntradaBot.valueOf() - b.dataEntradaBot.valueOf());

            const embed: EmbedBuilder = getEmbedServidoresBot(guilds);

            await interaction.reply({ 
                embeds: [embed],
                ephemeral: true 
            });
        }
        
        async function subCommandBotoes(interaction: ChatInputCommandInteraction): Promise<void> {
            const idBotao: string = interaction.options.getString('id_botao', true);
            const acaoBotao: string = interaction.options.getString('acao_botao', true);

            config().configButtons.set(idBotao, acaoBotao === 'S');

            await sincronizarConfigsBot();
            await mostrarHorarios(mainTextChannel());
            await interaction.reply({
                content: 'Botão atualizado com sucesso!',
                ephemeral: true 
            });
        }

        async function subCommandGetLog(interaction: ChatInputCommandInteraction): Promise<void> {
            // const tipoLog: string = interaction.options.getString('tipo_log', true);
            // const extensaoArquivo: string = interaction.options.getString('extensao_arquivo', true);

            // let objetoLog = {};

            // switch (tipoLog) {
            //     case "usuarios-singleton":
            //         objetoLog = usuariosSingleton.usuarios.map((usuario: Usuario) => {
            //             const copiaUsuario: any = Object.assign({}, usuario);
            //             copiaUsuario.timeOnline = [...copiaUsuario.timeOnline];
            //             return copiaUsuario;
            //         });
            //         break;
            //     case "geral-singleton":
            //         const copiaGeralSingleton: any = Object.assign({}, geralSingleton);
            //         copiaGeralSingleton.infoMember = [...copiaGeralSingleton.infoMember];
            //         objetoLog = copiaGeralSingleton;
            //         break;
            // }

            // const conteudoArquivo: string = JSON.stringify(objetoLog, null, 4);
            // const nomeArquivo: string = `${tipoLog}-${dataNowMoment().toISOString()}.${extensaoArquivo}`;
            // const caminhoArquivo: string = `${botIsProd ? 'prod': 'test'}/logs/${tipoLog}/${nomeArquivo}`;

            // await uploadFileString(caminhoArquivo, conteudoArquivo);
            // const linkDownload: string = await getLinkDownloadFile(caminhoArquivo);

            // interaction.reply({
            //     ephemeral: true,
            //     content: `[${nomeArquivo}](${linkDownload})`
            // });

            interaction.reply({
                ephemeral: true,
                content: 'Comando desativado.'
            });
        }

        async function subCommandMoveSala(interaction: ChatInputCommandInteraction): Promise<void> {
            const canalAtual: VoiceChannel = interaction.options.getChannel('canal_atual', true);
            const canalDestino: VoiceChannel = interaction.options.getChannel('canal_destino', true);

            const membros: GuildMember[] = [...canalAtual.members].map(m => m[1]);

            for (const membro of membros) {
                await membro.voice.setChannel(canalDestino);
            }

            await interaction.reply({
                ephemeral: true,
                content: `${membros.length} membros da sala ${canalAtual} foram movidos para sala ${canalDestino}`
            });
        }

        async function subCommandMoveUsuario(interaction: ChatInputCommandInteraction): Promise<void | InteractionResponse<boolean>> {
            const usuario: User = interaction.options.getUser('usuario', true);
            const canalDestino: VoiceChannel = interaction.options.getChannel('canal_destino', true);
            const membro: GuildMember | undefined = await canalDestino.guild?.members.fetch(usuario);

            if (!membro) {
                return await interaction.reply({
                    ephemeral: true,
                    content: `Não foi possível encontrar o membro ${usuario}`
                });
            }

            await membro.voice.setChannel(canalDestino);

            await interaction.reply({
                ephemeral: true,
                content: `O membro ${usuario} foi movido para sala ${canalDestino}`
            });
        }
    }
}

