import spritesheetUrl from '../../assets/images/spritesheet.webp'
import bgMainUrl from '../../assets/images/background.webp'
import reelsBgUrl from '../../assets/images/reels-background.webp'
import { ASSET_MAP } from '../config/asset-map'

export class Renderer {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    #sheet: HTMLImageElement = new Image()
    #bg: HTMLImageElement = new Image()
    #reelsBg: HTMLImageElement = new Image()
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
        this.ctx = this.canvas.getContext('2d')!
        this.#init()
    }

    async #init() {
        const loadImg = (img: HTMLImageElement, url: string) =>
            new Promise((resolve) => {
                img.onload = resolve
                img.src = url
            })

        await Promise.all([
            loadImg(this.#sheet, spritesheetUrl),
            loadImg(this.#bg, bgMainUrl),
            loadImg(this.#reelsBg, reelsBgUrl),
        ])

        this.isReady = true
        this.#resize()
        window.addEventListener('resize', () => this.#resize())
    }

    #resize() {
        const dpr = window.devicePixelRatio || 1
        const w = window.innerWidth
        const h = window.innerHeight

        this.canvas.width = w * dpr
        this.canvas.height = h * dpr

        this.canvas.style.width = `${w}px`
        this.canvas.style.height = `${h}px`

        this.ctx.resetTransform()
        this.ctx.scale(dpr, dpr)

        this.ctx.imageSmoothingEnabled = true
        this.ctx.imageSmoothingQuality = 'high'

        this.layout.bg.w = w
        this.layout.bg.h = h

        const reelsTargetWidth = w * 0.95
        const reelsScale = reelsTargetWidth / this.#reelsBg.width
        const reelsTargetHeight = this.#reelsBg.height * reelsScale

        this.layout.reels.w = reelsTargetWidth
        this.layout.reels.h = reelsTargetHeight
        this.layout.reels.x = (w - reelsTargetWidth) / 2
        this.layout.reels.y = (h - reelsTargetHeight) / 3

        const cols = 6
        const rows = 5
        const paddingFactorW = 0.91
        const paddingFactorH = 0.85
        const colWidthFactor = 0.9

        const usableWidth = this.layout.reels.w * paddingFactorW
        const usableHeight = this.layout.reels.h * paddingFactorH

        this.layout.colWidth = usableWidth / cols
        this.layout.symbolSize = Math.min(
            this.layout.colWidth * colWidthFactor,
            usableHeight / rows
        )

        this.layout.reelsStartX = this.layout.reels.x + (this.layout.reels.w - usableWidth) / 2
        this.layout.reelsStartY =
            this.layout.reels.y + (this.layout.reels.h - this.layout.symbolSize * rows) / 2
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    drawBackground() {
        if (!this.isReady) return

        this.ctx.drawImage(this.#bg, 0, 0, this.layout.bg.w, this.layout.bg.h)
    }

    drawReelsBackground() {
        if (!this.isReady) return

        const { x, y, w, h } = this.layout.reels
        this.ctx.drawImage(this.#reelsBg, x, y, w, h)
    }

    drawSprite(name: keyof typeof ASSET_MAP, x: number, y: number, scale = 1, rotation = 0) {
        if (!this.#sheet) return

        const data = ASSET_MAP[name]

        this.ctx.save()
        this.ctx.translate(x, y)
        this.ctx.rotate(rotation)
        this.ctx.scale(scale, scale)

        const drawW = data.w
        const drawH = data.h

        this.ctx.drawImage(
            this.#sheet,
            data.x,
            data.y,
            data.w,
            data.h,
            -drawW / 2,
            -drawH / 2,
            drawW,
            drawH
        )
        this.ctx.restore()
    }
}
