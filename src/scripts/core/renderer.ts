import spritesheetUrl from '../../assets/images/spritesheet.webp'
import bgMainUrl from '../../assets/images/background.webp'
import reelsBgUrl from '../../assets/images/reels-background.webp'
import { ASSET_MAP } from '../config/assets'

export class Renderer {
    canvas: HTMLCanvasElement | null
    ctx: CanvasRenderingContext2D | null
    #sheet: HTMLImageElement | null = null
    #bg: HTMLImageElement | null = null
    #reelsBg: HTMLImageElement | null = null
    isReady = false
    layout = {
        bg: { w: 0, h: 0 },
        reels: { x: 0, y: 0, w: 0, h: 0 },
        symbolSize: 0,
        reelsStartX: 0,
        reelsStartY: 0,
        colWidth: 0,
    }

    constructor() {
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement
        this.ctx = this.canvas?.getContext('2d', { alpha: false }) || null
    }

    async init() {
        const loadImg = (url: string): Promise<HTMLImageElement> =>
            new Promise((resolve) => {
                const img = new Image()
                img.onload = () => resolve(img)
                img.src = url
            })

        try {
            const [sheet, bg, reelsBg] = await Promise.all([
                loadImg(spritesheetUrl),
                loadImg(bgMainUrl),
                loadImg(reelsBgUrl),
            ])

            this.#sheet = sheet
            this.#bg = bg
            this.#reelsBg = reelsBg
            this.isReady = true

            this.handleResize()
        } catch (e) {
            console.error('Asset loading failed', e)
        }
    }

    handleResize = () => {
        if (!this.canvas || !this.ctx || !this.#reelsBg) return

        const dpr = window.devicePixelRatio || 1
        const w = window.innerWidth
        const h = window.innerHeight

        this.canvas.width = Math.floor(w * dpr)
        this.canvas.height = Math.floor(h * dpr)
        this.canvas.style.width = `${w}px`
        this.canvas.style.height = `${h}px`

        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        this.ctx.scale(dpr, dpr)

        this.ctx.imageSmoothingEnabled = true
        this.ctx.imageSmoothingQuality = 'high'

        this.layout.bg.w = w
        this.layout.bg.h = h

        const reelsTargetWidth = w * 0.95
        const reelsScale = reelsTargetWidth / this.#reelsBg.width
        const reelsTargetHeight = this.#reelsBg.height * reelsScale

        this.layout.reels.w = Math.floor(reelsTargetWidth)
        this.layout.reels.h = Math.floor(reelsTargetHeight)
        this.layout.reels.x = Math.floor((w - reelsTargetWidth) / 2)
        this.layout.reels.y = Math.floor((h - reelsTargetHeight) / 3)

        const cols = 6
        const rows = 5
        const usableWidth = this.layout.reels.w * 0.91
        const usableHeight = this.layout.reels.h * 0.85

        this.layout.colWidth = usableWidth / cols
        this.layout.symbolSize = Math.floor(
            Math.min(this.layout.colWidth * 0.9, usableHeight / rows)
        )

        this.layout.reelsStartX = Math.floor(
            this.layout.reels.x + (this.layout.reels.w - usableWidth) / 2
        )
        this.layout.reelsStartY = Math.floor(
            this.layout.reels.y + (this.layout.reels.h - this.layout.symbolSize * rows) / 2
        )
    }

    clear() {
        if (!this.ctx || !this.canvas) return

        this.ctx.save()
        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.restore()
    }

    drawBackground() {
        if (!this.ctx || !this.isReady || !this.#bg) return

        this.ctx.drawImage(this.#bg, 0, 0, this.layout.bg.w, this.layout.bg.h)
    }

    drawReelsBackground() {
        if (!this.ctx || !this.isReady || !this.#reelsBg) return

        const { x, y, w, h } = this.layout.reels
        this.ctx.drawImage(this.#reelsBg, x, y, w, h)
    }

    drawSprite(
        name: keyof typeof ASSET_MAP,
        x: number,
        y: number,
        scaleX = 1,
        rotation = 0,
        scaleY?: number
    ) {
        if (!this.ctx || !this.#sheet || !this.isReady) return

        const data = ASSET_MAP[name]
        const sY = scaleY ?? scaleX

        if (rotation === 0 && scaleX === 1 && sY === 1) {
            this.ctx.drawImage(
                this.#sheet,
                data.x,
                data.y,
                data.w,
                data.h,
                x - Math.floor(data.w / 2),
                y - Math.floor(data.h / 2),
                data.w,
                data.h
            )
            return
        }

        this.ctx.save()
        this.ctx.translate(x, y)
        this.ctx.rotate(rotation)
        this.ctx.scale(scaleX, sY)

        this.ctx.drawImage(
            this.#sheet,
            data.x,
            data.y,
            data.w,
            data.h,
            -data.w / 2,
            -data.h / 2,
            data.w,
            data.h
        )
        this.ctx.restore()
    }

    destroy() {
        this.isReady = false

        if (this.#sheet) this.#sheet.src = ''
        if (this.#bg) this.#bg.src = ''
        if (this.#reelsBg) this.#reelsBg.src = ''

        this.#sheet = null
        this.#bg = null
        this.#reelsBg = null
        this.ctx = null
        this.canvas = null
    }
}
