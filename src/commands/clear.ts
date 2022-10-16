import { ApplicationCommandType, Collection, ContextMenuCommandBuilder, Message, MessageContextMenuCommandInteraction, PermissionFlagsBits, TextChannel } from "discord.js";
import { CategoryCommand } from "../models/enum/category-command";

export = {
    category: CategoryCommand.GERAL,
    data: new ContextMenuCommandBuilder()
        .setName('Apagar até aqui')
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    execute: async (interaction: MessageContextMenuCommandInteraction): Promise<void> => {
        await interaction.deferReply({ ephemeral: true });

        const mensagemSelecionada: Message = interaction.targetMessage;
        const canalSelecionado: TextChannel = mensagemSelecionada.channel as TextChannel;
        const mensagensEncontradas: Collection<string, Message> = await canalSelecionado.messages.fetch({ limit: 100, after: mensagemSelecionada.id });
        
        await canalSelecionado.bulkDelete([mensagemSelecionada, ...mensagensEncontradas.values()].filter(m => !m.pinned))
            .then(async (msgs) => await interaction.followUp({ content: `${msgs.size} mensagens excluídas!`, ephemeral: true }))
            .catch(async () => await interaction.followUp({ content: `Falha ao apagar as mensagens!`, ephemeral: true }));
    }
}