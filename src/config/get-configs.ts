import configProd from './config-prod.json';
import configTeste from './config-teste.json';

const isProd: boolean = false;
const bdIsProd: boolean = false;

if (!isProd && bdIsProd) {
    configTeste.firebaseConfig = configProd.firebaseConfig;
    configTeste.bossFirestoreConfig = configProd.bossFirestoreConfig;
}

const config = isProd ? configProd : configTeste;

export { config }