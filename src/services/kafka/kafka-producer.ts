import { Partitioners, RecordMetadata } from 'kafkajs';
import { kafkaClient } from './kafka-client';

const producer = kafkaClient.producer({ createPartitioner: Partitioners.LegacyPartitioner });

const sendMessageKafka = async(topic: string, message: string): Promise<RecordMetadata[]> => {
    // return Promise.resolve([] as RecordMetadata[]);
    await producer.connect();
    return await producer.send({
        topic: topic,
        messages: [
            { value: Buffer.from(message) },
        ],
    });
}

export { sendMessageKafka }