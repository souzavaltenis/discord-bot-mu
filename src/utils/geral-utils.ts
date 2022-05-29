import { bold, underscore } from "@discordjs/builders";
import { Moment } from "moment";
import { bossFirestoreConfig } from '../../config.json';

const tracos = (quantidade: number): string => {
    let str: string = '';
    for(let i=0; i<quantidade; i++) {
        str += '-';
    }
    return str;
}

const numberToEmoji = (n: number): string => {
    switch(n) {
        case 0: return ':zero:';
        case 1: return ':one:';
        case 2: return ':two:';
        case 3: return ':three:';
        case 4: return ':four:';
        case 5: return ':five:';
        case 6: return ':six:';
        case 7: return ':seven:';
        case 8: return ':eight:';
        case 9: return ':nine:';
        default: return '';
    }
}

const numbersToEmoji = (n: number): string => {
    const emojisUnicode: string[] = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    const digits: number[] = n.toString().split('').map(Number);
    return digits.reduce((acc: string, digit: number) => acc + emojisUnicode[digit], '');
}

const underbold = (str: string): string => {
    return underscore(bold(str));
}

const formatInfosInputs = (nomeDocBoss: string, salaBoss: number, horarioInformado: Moment): string => {
    let nomeBoss = '';

    switch(nomeDocBoss) {
        case bossFirestoreConfig.docs.docRei:       nomeBoss = "Rei Kundun"; break; 
        case bossFirestoreConfig.docs.docRelics:    nomeBoss = "Relics";     break; 
        case bossFirestoreConfig.docs.docFenix:     nomeBoss = "Fenix";      break; 
        case bossFirestoreConfig.docs.docDeathBeam: nomeBoss = "Death Beam"; break;
    }

    const infoHorario: string = horarioInformado.format('HH:mm');
    const infoData: string = horarioInformado.format('DD/MM');
    const infosInputs: string = `${underbold(nomeBoss)} sala ${underbold(salaBoss+'')} às ${underbold(infoHorario)} dia ${underbold(infoData)}`;

    return infosInputs;
}

export { tracos, numberToEmoji, numbersToEmoji, underbold, formatInfosInputs }