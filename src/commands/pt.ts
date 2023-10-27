import { ChatInputCommandInteraction, InteractionResponse, PermissionFlagsBits, SlashCommandBuilder, User } from "discord.js";
import { CategoryCommand } from "../models/enum/category-command";
import { ativarMembroPT, desativarMembroPT } from "../db/db";
import { usuariosSingleton } from "../models/singleton/usuarios-singleton";
import { Usuario } from "../models/usuario";
import { client } from "..";
import { INickInfo } from "../models/interface/nick-info";

export = {
    category: CategoryCommand.GERAL,
    data: new SlashCommandBuilder()
        .setName('pt')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('Gerenciar membros da PT de Boss')
        .addSubcommand(subcommand => {
            subcommand.setName('add')
                .setDescription('Adicionar nick da PT')
                .addStringOption(option => option.setName('nick').setDescription('Qual nick deseja adicionar a PT?').setRequired(true))
                .addUserOption(option => option.setName('user_discord').setDescription('Qual usuário do discord vinculado a esse nick?').setRequired(true));
            return subcommand;
        })
        .addSubcommand(subcommand => {
            subcommand.setName('remove')
                .setDescription('Remover nick da PT')
                .addStringOption(option => option.setName('nick').setDescription('Qual nick deseja remover da PT?').setRequired(true));
            return subcommand;
        }),
        
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const opcaoSubCommand: string = interaction.options.getSubcommand();

        switch (opcaoSubCommand) {
            case "add": await subCommandAdd(interaction); break;
            case "remove": await subCommandRemove(interaction); break;
        }

        async function subCommandAdd(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
            const nick: string = interaction.options.getString('nick', true);
            const userDiscord: User = interaction.options.getUser('user_discord', true);

            const usuarioPT: Usuario | undefined = usuariosSingleton.usuarios.find((u: Usuario) => {
                return u.nicks.some((n: INickInfo) => n.nick === nick && n.ativo);
            });

            if (usuarioPT) {
                return await interaction.reply({
                    content: `Nick \`${nick}\` já está setado para o usuário <@${usuarioPT.id}>`
                });
            }

            await ativarMembroPT(nick, userDiscord, interaction.user.id);

            return await interaction.reply({
                content: `[✅] Nick \`${nick}\` foi **adicionado** a PT`
            });
        }

        async function subCommandRemove(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
            const nick: string = interaction.options.getString('nick', true);

            const usuario: Usuario | undefined = usuariosSingleton.usuarios.find((u: Usuario) => {
                return u.nicks.some(n => n.nick === nick);
            });

            if (!usuario) {
                return await interaction.reply({
                    content: `Não foi possível localizar o usuário responsável pelo nick \`${nick}\``
                });
            }

            const userDiscord: User = await client.users.fetch(usuario.id);
            
            await desativarMembroPT(nick, userDiscord, interaction.user.id);

            return await interaction.reply({
                content: `[🗑️] Nick \`${nick}\` foi **removido** da PT`
            });
        }
    }
}