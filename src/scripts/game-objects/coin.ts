export class Coin {
    x: number = 0
    y: number = 0
    speed: number = 0
    rotation: number = 0
    rotationSpeed: number = 0
    flip: number = 0
    flipSpeed: number = 0
    scale: number = 0

    constructor() {}

    reset(canvasWidth: number = window.innerWidth) {
        this.x = Math.random() * canvasWidth
        this.y = -50 - Math.random() * 500
        this.speed = 400 + Math.random() * 600
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 5
        this.scale = 0.2 + Math.random() * 0.3
        this.flip = Math.random() * Math.PI
        this.flipSpeed = 3 + Math.random() * 5
    }

    update(dt: number) {
        this.y += this.speed * dt
        this.rotation += this.rotationSpeed * dt
        this.flip += this.flipSpeed * dt
    }
}
