import { Moment } from "moment";
import { Boss } from "../models/boss";
import { TimeoutSingleton } from "../models/singleton/timeout-singleton";
import { vaiAbrirBoss, calcularHorarioRestanteBoss, vaiFecharBoss, atualizarStatusBot } from "./boss-utils";
import { config } from '../config/get-configs';
import { mensagemAvisoAbertura, mensagemAvisoAberturaGeral, mensagemAvisoFechamento } from "../utils/mensagens-utils";
import { sincronizarConfigsBot } from "../db/db";

const agendarAvisos = (listaBoss: Boss[]): void => {
    limparTimeoutsBoss();
    atualizarStatusBot();

    if (verificarReset(listaBoss)) return;

    listaBoss.forEach((boss: Boss) => {
        boss.salas.forEach((horarioBoss: Moment, sala: number) => {
            const idTimeoutAberto: string = `${boss.nome}.Sala.${sala}.Aberto`.replace(/ /g, '');
            const idTimeoutFechado: string = `${boss.nome}.Sala.${sala}.Fechado`.replace(/ /g, '');

            if (vaiAbrirBoss(horarioBoss)) {
                const horarioAteAbrir: number = calcularHorarioRestanteBoss(horarioBoss, config().mu.horaBossInicial).valueOf();
                const horarioAteFechar: number = calcularHorarioRestanteBoss(horarioBoss, config().mu.horaBossFinal).valueOf();

                adicionarTimeoutBoss(idTimeoutAberto, mensagemAvisoAbertura, horarioAteAbrir, boss.nome, sala);
                adicionarTimeoutBoss(idTimeoutFechado, mensagemAvisoFechamento, horarioAteFechar, boss.nome, sala);
            } 
            
            if (vaiFecharBoss(horarioBoss)) {
                const horarioAteFechar: number = calcularHorarioRestanteBoss(horarioBoss, config().mu.horaBossFinal).valueOf();
                adicionarTimeoutBoss(idTimeoutFechado, mensagemAvisoFechamento, horarioAteFechar, boss.nome, sala);
            }
        });
    });
}

const adicionarTimeoutBoss = (idTimeout: string, funcaoAviso: (nomeBoss: string, salaBoss: number) => Promise<void>, time: number,  nomeBoss: string, sala: number): void => {
    const timeouts: Map<string, NodeJS.Timeout> = TimeoutSingleton.getInstance().timeouts;
    const refTimeout: NodeJS.Timeout = setTimeout(funcaoAviso, time, nomeBoss, sala);
    timeouts.set(idTimeout, refTimeout);
}

const adicionarTimeoutGeral = (idTimeout: string, funcao: () => Promise<void>, time: number): void => {
    const timeouts: Map<string, NodeJS.Timeout> = TimeoutSingleton.getInstance().timeouts;
    const refTimeout: NodeJS.Timeout = setTimeout(funcao, time);
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

const verificarReset = (listaBoss: Boss[]): boolean => {
    if (!listaBoss.length) return false;
    
    if (config().mu.isHorariosReset) {
        const horario: Moment = Array.from(listaBoss[0].salas.values())[0];

        if (vaiAbrirBoss(horario)) {
            const horarioAteAbrirGeral: number = calcularHorarioRestanteBoss(horario, config().mu.horaBossInicial).valueOf();
            adicionarTimeoutGeral("Horarios.Reset", mensagemAvisoAberturaGeral, horarioAteAbrirGeral);
            return true;
        }

        if (vaiFecharBoss(horario)) {
            config().mu.isHorariosReset = false;
            sincronizarConfigsBot();
        }
    }

    return false;
}

export { agendarAvisos }