import { carregarConfigsBot } from '../db/db';
import { ConfigBot } from '../models/config-bot';
import { ConfigBotSingleton } from '../models/singleton/config-bot-singleton';

const botIsProd: boolean = true;
const bdIsProd: boolean = true;

const loadConfig = async (): Promise<void> => await carregarConfigsBot();
const config = (): ConfigBot => ConfigBotSingleton.getInstance().configBot;

export { botIsProd, bdIsProd, loadConfig, config }