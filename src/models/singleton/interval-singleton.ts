class IntervalSingleton {
    intervalId: NodeJS.Timeout | undefined;
}

export const intervalUpdate: IntervalSingleton = new IntervalSingleton();