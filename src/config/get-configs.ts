import { carregarDadosBot } from '../db/db';
import { ConfigBot } from '../models/config-bot';
import { ConfigBotSingleton } from '../models/singleton/config-bot-singleton';

const botIsProd: boolean = false;
const bdIsProd: boolean = false;

const loadData = async (): Promise<void> => await carregarDadosBot();
const config = (): ConfigBot => ConfigBotSingleton.getInstance().configBot;

export { botIsProd, bdIsProd, loadData, config }