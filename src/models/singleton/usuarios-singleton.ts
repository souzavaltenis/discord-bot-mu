import { Usuario } from "../usuario";

class UsuariosSingleton {
    public usuarios: Usuario[] = [];
}

export const usuariosSingleton = new UsuariosSingleton();
