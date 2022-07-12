import { Moment } from "moment";
import { Boss } from "../models/boss";
import { TimeoutSingleton } from "../models/singleton/timeout-singleton";
import { vaiAbrirBoss, calcularHorarioRestanteBoss, vaiFecharBoss, atualizarStatusBot } from "./boss-utils";
import { config } from '../config/get-configs';
import { mensagemAvisoAbertura, mensagemAvisoFechamento } from "../utils/mensagens-utils";

const agendarAvisos = (listaBoss: Boss[]): void => {
    limparTimeoutsBoss();

    listaBoss.forEach((boss: Boss) => {
        boss.salas.forEach((horarioBoss: Moment, sala: number) => {
            const idTimeoutAberto: string = `${boss.nome}.Sala.${sala}.Aberto`.replace(/ /g, '');
            const idTimeoutFechado: string = `${boss.nome}.Sala.${sala}.Fechado`.replace(/ /g, '');

            if (vaiAbrirBoss(horarioBoss)) {
                const horarioAteAbrir: number = calcularHorarioRestanteBoss(horarioBoss, config().mu.horaBossInicial).valueOf();
                const horarioAteFechar: number = calcularHorarioRestanteBoss(horarioBoss, config().mu.horaBossFinal).valueOf();

                adicionarTimeout(idTimeoutAberto, mensagemAvisoAbertura, horarioAteAbrir, boss.nome, sala);
                adicionarTimeout(idTimeoutFechado, mensagemAvisoFechamento, horarioAteFechar, boss.nome, sala);
            } 
            
            if (vaiFecharBoss(horarioBoss)) {
                const horarioAteFechar: number = calcularHorarioRestanteBoss(horarioBoss, config().mu.horaBossFinal).valueOf();
                adicionarTimeout(idTimeoutFechado, mensagemAvisoFechamento, horarioAteFechar, boss.nome, sala);
            }
        });
    });

    atualizarStatusBot();
}

const adicionarTimeout = (idTimeout: string, funcaoAviso: (nomeBoss: string, salaBoss: number) => Promise<void>, time: number,  nomeBoss: string, sala: number): void => {
    const timeouts: Map<string, NodeJS.Timeout> = TimeoutSingleton.getInstance().timeouts;
    const refTimeout: NodeJS.Timeout = setTimeout(funcaoAviso, time, nomeBoss, sala);
    timeouts.set(idTimeout, refTimeout);
}

const limparTimeoutsBoss = (): void => {
    const timeouts: Map<string, NodeJS.Timeout> = TimeoutSingleton.getInstance().timeouts;
    const keysTimeouts: string[] = Array.from(timeouts.keys());

    keysTimeouts.forEach((key: string) => {
        const refTimeout: NodeJS.Timeout | undefined = timeouts.get(key);
        if (refTimeout) {
            clearTimeout(refTimeout);
            timeouts.delete(key);
        }
    });
}

export { agendarAvisos }