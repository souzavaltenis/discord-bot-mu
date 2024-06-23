export interface IRabbitMQConfigBot {
    url: string;
    nameExchange: string;
    routingKeys: IRabbitMQRoutingKeys;
}

export interface IRabbitMQRoutingKeys {
    errosApp: string;
    logsErrosInput: string;
    logsGeral: string;
}