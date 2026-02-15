export class Coin {
    x: number = 0
    y: number = 0
    speed: number = 0
    rotation: number = 0
    rotationSpeed: number = 0
    flip: number = Math.random() * Math.PI
    flipSpeed: number = 3 + Math.random() * 5
    scale: number = 0

    constructor() {
        this.reset()
    }

    reset() {
        this.x = Math.random() * window.innerWidth
        this.y = -50 - Math.random() * 200
        this.speed = 300 + Math.random() * 400
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 5
        this.scale = 0.2 + Math.random() * 0.25
        this.flip = Math.random() * Math.PI
    }

    update(dt: number) {
        this.y += this.speed * dt
        this.rotation += this.rotationSpeed * dt
        this.flip += this.flipSpeed * dt
    }
}
