class IntervalSingleton {
    intervalId: NodeJS.Timer | undefined;
}

export const intervalUpdate: IntervalSingleton = new IntervalSingleton();