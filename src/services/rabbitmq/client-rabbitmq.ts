import amqplib from 'amqplib';
import { config } from '../../config/get-configs';

class ClientRabbitMQ {
    private connection!: amqplib.Connection;
    private channel!: amqplib.Channel;
    private isReady: boolean = false;
    private nameExchange!: string;

    private async setup(): Promise<void> {
        this.connection = await amqplib.connect(config().rabbitmq.url);
        this.channel =  await this.connection.createChannel();
        this.nameExchange = config().rabbitmq.nameExchange;

        await this.channel.assertExchange(this.nameExchange, 'topic', { durable: true });
        this.isReady = true;
    }

    private async checkSetup(): Promise<void> {
        if (!this.isReady) {
            await this.setup();
        }
    }

    async produceMessage(routingKey: string, message: string): Promise<void> {
        try {
            await this.checkSetup();

            const result: boolean = this.channel.publish(this.nameExchange, routingKey, Buffer.from(message));

            if (!result) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await new Promise(resolve => (this.channel as any).once('drain', resolve));
                await this.produceMessage(routingKey, message);
            }
        } catch (error) {
            console.log('Error on produce message:', error);
        }
    }

    async consumeMessages(queue: string, rountingKey: string, callback: (message: amqplib.ConsumeMessage | null) => void): Promise<void> {
        try {
            await this.checkSetup();

            await this.channel.assertQueue(queue);
            await this.channel.bindQueue(queue, this.nameExchange, rountingKey);
        
            await this.channel.consume(queue, callback, { noAck: true });

            console.log('Loaded Consumer RabbitMQ');
        } catch (error) {
            console.log('Error on load consumer RabbitMQ:', error);
        }
    }
}

export const clientRabbitMQ = new ClientRabbitMQ();