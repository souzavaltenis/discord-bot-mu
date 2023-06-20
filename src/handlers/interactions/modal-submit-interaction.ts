import { ModalSubmitInteraction } from "discord.js";
import { Ids } from "../../models/ids";
import { AdicionarHorarioModal } from "../../templates/modals/adicionar-horario-modal";
import { SorteioModal } from "../../templates/modals/sorteio-modal";

export = {
    name: 'ModalSubmitInteraction',
    action: async (interaction: ModalSubmitInteraction): Promise<void> => {
        switch (interaction.customId) {
            case Ids.MODAL_ADICIONAR_HORARIO_BOSS:
                await new AdicionarHorarioModal().action(interaction);
                break;
            case Ids.MODAL_SORTEIO_DROPS:
                await new SorteioModal().action(interaction);
                break;
        }
    }
}