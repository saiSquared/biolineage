export declare class AutoScroller {
    private config;
    private onTick;
    private rafId;
    private dx;
    private dy;
    constructor(config: {
        container: HTMLElement;
        margin: number;
        maxSpeed: number;
    }, onTick: () => void);
    update(clientX: number, clientY: number): void;
    private calculateSpeed;
    private startLoop;
    stopLoop(): void;
}
