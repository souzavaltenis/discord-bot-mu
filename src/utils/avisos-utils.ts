import { Moment } from "moment";
import { Boss } from "../models/boss";
import { IdBossSala } from "../models/id-boss-sala";
import { TimeoutSingleton } from "../models/singleton/timeout-singleton";
import { vaiAbrirBoss, calcularHorarioRestanteBoss, vaiFecharBoss } from "./boss-utils";
import { config } from '../config/get-configs';
import { TextBasedChannel } from "discord.js";
import { mensagemAvisoAbertura, mensagemAvisoFechamento } from "../utils/mensagens-utils";
// import { adicionarTimeoutsDB } from "../db/db";
import { client } from "../index";

const agendarAvisos = (listaBoss: Boss[]): void => {
    const textChannel = client.channels.cache.get(config.channelTextId) as TextBasedChannel;

    if (!client || !textChannel) return;

    let contadorBossAbertos: number = 0;

    listaBoss.forEach((boss: Boss) => {
        boss.salas.forEach((horarioBoss: Moment, sala: number) => {
            const idBossSala = new IdBossSala(boss.id, sala);

            limparTimeoutsBoss(idBossSala);

            if (vaiAbrirBoss(horarioBoss)) {
                const horarioAteAbrir: number = calcularHorarioRestanteBoss(horarioBoss, config.bossFirestoreConfig.horaBossInicial).valueOf();
                const horarioAteFechar: number = calcularHorarioRestanteBoss(horarioBoss, config.bossFirestoreConfig.horaBossFinal).valueOf();

                adicionarTimeout(idBossSala.aberto, mensagemAvisoAbertura, horarioAteAbrir, boss.nome, sala, textChannel);
                adicionarTimeout(idBossSala.fechado, mensagemAvisoFechamento, horarioAteFechar, boss.nome, sala, textChannel);
            } 
            
            if (vaiFecharBoss(horarioBoss)) {
                contadorBossAbertos++;
                const horarioAteFechar: number = calcularHorarioRestanteBoss(horarioBoss, config.bossFirestoreConfig.horaBossFinal).valueOf();
                adicionarTimeout(idBossSala.fechado, mensagemAvisoFechamento, horarioAteFechar, boss.nome, sala, textChannel);
            }
        });
    });

    client.user?.setPresence({ activities: [{ name: `Boss Abertos :: ${contadorBossAbertos}`, type: 'PLAYING' }], status: 'idle' });
    // adicionarTimeoutsDB();
}

const adicionarTimeout = (
    idTimeout: string, 
    funcaoAviso: (nomeBoss: string, salaBoss: number, textChannel: TextBasedChannel | null) => Promise<void>, 
    time: number, 
    nomeBoss: string, 
    sala: number, 
    textChannel: TextBasedChannel | null
): void => {
    const timeouts: Map<string, NodeJS.Timeout> = TimeoutSingleton.getInstance().timeouts;
    const refTimeout = setTimeout(funcaoAviso, time, nomeBoss, sala, textChannel);
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