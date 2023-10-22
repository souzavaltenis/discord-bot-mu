export class TimeoutSingleton {
    private static instance: TimeoutSingleton;

    timeouts: Map<string, NodeJS.Timeout>;
    timeoutAlteracaoBdBot: NodeJS.Timeout | undefined;

    constructor(timeouts: Map<string, NodeJS.Timeout>, timeoutAlteracaoBdBot?: NodeJS.Timeout) {
        this.timeouts = timeouts;
        this.timeoutAlteracaoBdBot = timeoutAlteracaoBdBot;
    }

    static getInstance(): TimeoutSingleton {
        if (!this.instance) {
            this.instance = new this(new Map<string, NodeJS.Timeout>());
        }
        return this.instance;
    }
}