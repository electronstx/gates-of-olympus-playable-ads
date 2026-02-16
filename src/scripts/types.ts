export type GameObject = {
    draw(): void
    update(dt: number): void
    updatePosition(): void
    destroy(): void
}

export const GAME_STATE = {
    START: 'START',
    IDLE: 'IDLE',
    SPIN: 'SPIN',
    WIN: 'WIN',
    END: 'END',
} as const

export type GameState = (typeof GAME_STATE)[keyof typeof GAME_STATE]

export type SpriteData = {
    x: number
    y: number
    w: number
    h: number
    rotated?: boolean
}
