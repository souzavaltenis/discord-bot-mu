// import { EmbedBuilder, Message, TextChannel } from "discord.js";
// import { client } from "../index";
// import { Ids } from "../models/ids";
// import { timeoutsUpdate } from "../models/singleton/timeouts-update";
// import { getEmbedTabelaProximos } from "../templates/embeds/tabela-proximos-embed";

// class AutoUpdateUtil {

//     idChannel: string;
//     idMessage: string;
//     idSetIntervalTableProximos?: NodeJS.Timer;
//     secondsIntervalUpdate: number;
//     isStop: boolean = false;
//     id: string;

//     constructor(idChannel: string, idMessage: string, secondsIntervalUpdate: number = 10) {
//         this.idChannel = idChannel;
//         this.idMessage = idMessage;
//         this.secondsIntervalUpdate = secondsIntervalUpdate;
//         this.id = new Date().valueOf().toString();
//     }

//     initAutoUpdateTableProximos = () => {
//         this.stopAutoUpdateTableProximos();
//         this.isStop = false;
//         this.idSetIntervalTableProximos = setInterval(async () => {
//             if (!this.isStop) {
//                 await this.updateTableProximos();
//             }
//         }, this.secondsIntervalUpdate * 1000);
//         timeoutsUpdate.set(this.id, this.idSetIntervalTableProximos);
//     }

//     stopAutoUpdateTableProximos = () => {
//         if (this.idSetIntervalTableProximos) {
//             this.isStop = true;
//             clearInterval(this.idSetIntervalTableProximos);
//             timeoutsUpdate.delete(this.id);
//         }
//     }

//     updateTableProximos = async (): Promise<void> => {
//         if (this.isStop) return;

//         const message: Message | undefined = await this.getMessageUpdated(this.idChannel, this.idMessage);
//         const isTableProximosVaiAbrir: boolean = this.isEmbedTableProximosVaiAbrir(message);
    
//         const embedTableProximos: EmbedBuilder = getEmbedTabelaProximos(isTableProximosVaiAbrir);
        
//         await message?.edit({
//             embeds: [embedTableProximos]
//         });
//     }

//     isEmbedTableProximosVaiAbrir = (message: Message | undefined): boolean => {
//         if (!message) return false;
    
//         return message.components.some(row => 
//             row.components.some(component => component.customId === Ids.BUTTON_ABRIR_PROXIMOS && component.disabled === true)
//         );
//     }

//     getMessageUpdated = async (idChannel: string, idMessage: string): Promise<Message | undefined> => {
//         if (!idChannel || !idMessage) return;
    
//         const channelCache = client.channels.cache.get(idChannel) as TextChannel;
//         const messageCache = channelCache.messages.cache.get(idMessage);
//         const messageFetch = await messageCache?.fetch(true);
    
//         return messageFetch;
//     }

// }

// const autoUpdatesProximos = new Map<string, AutoUpdateUtil>();

// export {
//     AutoUpdateUtil,
//     autoUpdatesProximos,
// }