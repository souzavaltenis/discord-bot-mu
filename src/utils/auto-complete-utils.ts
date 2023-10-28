import { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from "discord.js";
import { usuariosSingleton } from "../models/singleton/usuarios-singleton";
import { Usuario } from "../models/usuario";
import { INickInfo } from "../models/interface/nick-info";

async function autoCompleteNicks(interaction: AutocompleteInteraction, nickSearch: string): Promise<void> {
    const todosNicksAtivos: string[] = usuariosSingleton.usuarios
        .map((usuario: Usuario) => {
            return usuario.nicks
                .filter((nick: INickInfo) => nick.ativo)
                .map((nick: INickInfo) => nick.nick);
        })
        .flat();

    let nicksFiltrados: string[] = todosNicksAtivos.filter((nick: string) => {
        return nick.toLowerCase().includes(nickSearch.toLowerCase());
    });

    if (nicksFiltrados.length === 0) {
        return await interaction.respond([{ name: 'Nenhum resultado encontrado', value: '' }]);
    }

    if (nicksFiltrados.length > 25) {
        nicksFiltrados = nicksFiltrados.slice(0, 25);
    }

    nicksFiltrados.sort((a: string, b: string) => a.toLowerCase() > b.toLowerCase() ? 1 : -1);

    const resultadosNicks: ApplicationCommandOptionChoiceData[] = nicksFiltrados.map((nick: string) => {
        return { name: nick, value: nick };
    });

    await interaction.respond(resultadosNicks);
}

export {
    autoCompleteNicks
}