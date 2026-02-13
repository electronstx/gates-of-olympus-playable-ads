export type GameObject = {
    draw(): void
    update(dt: number): void
    destroy(): void
}

export const GAME_STATE = {
    START: 'START',
    IDLE: 'IDLE',
    SPIN: 'SPIN',
    WIN: 'WINNING',
    END: 'END',
} as const

export type GameState = (typeof GAME_STATE)[keyof typeof GAME_STATE]

export type EmitterCallback = (data?: any) => void

export type SpriteData = {
    x: number
    y: number
    w: number
    h: number
    rotated?: boolean
}
