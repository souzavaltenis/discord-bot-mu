import { Moment } from "moment";
import { Boss } from "../models/boss";
import { IdBossSala } from "../models/id-boss-sala";
import { TimeoutSingleton } from "../models/singleton/timeout-singleton";
import { vaiAbrirBoss, calcularHorarioRestanteBoss, vaiFecharBoss, atualizarStatusBot } from "./boss-utils";
import { config } from '../config/get-configs';
import { mensagemAvisoAbertura, mensagemAvisoFechamento } from "../utils/mensagens-utils";
// import { adicionarTimeoutsDB } from "../db/db";

const agendarAvisos = (listaBoss: Boss[]): void => {
    listaBoss.forEach((boss: Boss) => {
        boss.salas.forEach((horarioBoss: Moment, sala: number) => {
            const idBossSala = new IdBossSala(boss.id, sala);

            limparTimeoutsBoss(idBossSala);

            if (vaiAbrirBoss(horarioBoss)) {
                const horarioAteAbrir: number = calcularHorarioRestanteBoss(horarioBoss, config.bossFirestoreConfig.horaBossInicial).valueOf();
                const horarioAteFechar: number = calcularHorarioRestanteBoss(horarioBoss, config.bossFirestoreConfig.horaBossFinal).valueOf();

                adicionarTimeout(idBossSala.aberto, mensagemAvisoAbertura, horarioAteAbrir, boss.nome, sala);
                adicionarTimeout(idBossSala.fechado, mensagemAvisoFechamento, horarioAteFechar, boss.nome, sala);
            } 
            
            if (vaiFecharBoss(horarioBoss)) {
                const horarioAteFechar: number = calcularHorarioRestanteBoss(horarioBoss, config.bossFirestoreConfig.horaBossFinal).valueOf();
                adicionarTimeout(idBossSala.fechado, mensagemAvisoFechamento, horarioAteFechar, boss.nome, sala);
            }
        });
    });

    atualizarStatusBot();
    // adicionarTimeoutsDB();
}

const adicionarTimeout = (
    idTimeout: string, 
    funcaoAviso: (nomeBoss: string, salaBoss: number) => Promise<void>, 
    time: number, 
    nomeBoss: string, 
    sala: number
): void => {
    const timeouts: Map<string, NodeJS.Timeout> = TimeoutSingleton.getInstance().timeouts;
    const refTimeout = setTimeout(funcaoAviso, time, nomeBoss, sala);
    timeouts.set(idTimeout, refTimeout);
}

const limparTimeoutsBoss = (idBossSala: IdBossSala): void => {
    const timeouts: Map<string, NodeJS.Timeout> = TimeoutSingleton.getInstance().timeouts;

    for (const key in idBossSala) {
        const idTimeout = idBossSala[key as keyof IdBossSala];
        const refTimeout: NodeJS.Timeout | undefined = timeouts.get(idTimeout);
        if (refTimeout) {
            clearTimeout(refTimeout);
            timeouts.delete(idTimeout);
        }
    }
}

export { agendarAvisos }