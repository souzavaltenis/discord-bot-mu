import configProd from './config-prod.json';
import configTeste from './config-teste.json';

const botIsProd: boolean = true;
const bdIsProd: boolean = true;

if (!botIsProd && bdIsProd) {
    configTeste.firebaseConfig = configProd.firebaseConfig;
    configTeste.bossFirestoreConfig = configProd.bossFirestoreConfig;
}

const config = botIsProd ? configProd : configTeste;

export { config, botIsProd }