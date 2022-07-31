import { EmbedBuilder, Message, TextChannel } from "discord.js";
import { config } from "../config/get-configs";
import { client } from "../index";
import { Ids } from "../models/ids";
import { getEmbedTabelaProximos } from "../templates/embeds/tabela-proximos-embed";

class AutoUpdateUtil {

    idSetIntervalTableProximos?: NodeJS.Timer;
    secondsIntervalUpdate: number = 10;

    initAutoUpdateTableProximos = () => {
        this.stopAutoUpdateTableProximos();
        this.idSetIntervalTableProximos = setInterval(async () => await this.updateTableProximos(), this.secondsIntervalUpdate * 1000);
    }

    stopAutoUpdateTableProximos = () => {
        if (this.idSetIntervalTableProximos) {
            clearInterval(this.idSetIntervalTableProximos);
        }
    }

    updateTableProximos = async (): Promise<void> => {
        const lastMessage: Message | undefined = await this.getMessageUpdated(config().channels.textHorarios, config().geral.idLastMessageBoss);
        const isTableProximosVaiAbrir: boolean = this.isEmbedTableProximosVaiAbrir(lastMessage);
    
        const embedTableProximos: EmbedBuilder = getEmbedTabelaProximos(isTableProximosVaiAbrir);
        
        await lastMessage?.edit({
            embeds: [embedTableProximos]
        });
    }

    isEmbedTableProximosVaiAbrir = (message: Message | undefined): boolean => {
        if (!message) return false;
    
        return message.components.some(row => 
            row.components.some(component => component.customId === Ids.BUTTON_ABRIR_PROXIMOS && component.disabled === true)
        );
    }

    getMessageUpdated = async (idChannel: string, idMessage: string): Promise<Message | undefined> => {
        if (!idChannel || !idMessage) return;
    
        const channelCache = client.channels.cache.get(idChannel) as TextChannel;
        const messageCache = channelCache.messages.cache.get(idMessage);
        const messageFetch = await messageCache?.fetch(true);
    
        return messageFetch;
    }

}

export const autoUpdateUtil = new AutoUpdateUtil();