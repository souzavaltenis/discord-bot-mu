import { carregarDadosBot } from '../db/db';
import { ConfigBot } from '../models/config-bot';
import { ConfigBotSingleton } from '../models/singleton/config-bot-singleton';

const botIsProd: boolean = true;
const bdIsProd: boolean = true;

const loadData = async (): Promise<void> => await carregarDadosBot();
const config = (): ConfigBot => ConfigBotSingleton.getInstance().configBot;

export { botIsProd, bdIsProd, loadData, config }