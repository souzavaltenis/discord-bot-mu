import configProd from './config-prod.json';
import configTeste from './config-teste.json';

const isProd: boolean = true;

const config = isProd ? configProd : configTeste;

export { config }