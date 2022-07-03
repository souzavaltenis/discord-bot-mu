import { Partitioners, RecordMetadata } from 'kafkajs';
import { botIsProd } from '../../config/get-configs';
import { kafkaClient } from './kafka-client';

const producer = kafkaClient.producer({ createPartitioner: Partitioners.LegacyPartitioner });

const sendMessageKafka = async (topic: string, message: string): Promise<RecordMetadata[]> => {
    if (!botIsProd) return [];
    
    await producer.connect();
    return await producer.send({
        topic: topic,
        messages: [
            { value: Buffer.from(message) },
        ],
    });
}

export { sendMessageKafka }