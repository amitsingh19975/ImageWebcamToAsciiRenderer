export class Webcam {
    private _videoEl = document.createElement('video')
    private _frameListeners: ((frame: ImageData) => void)[] = []
    private _stream: MediaStream | null = null
    private _width: number = 640
    private _height: number = 480
    
    constructor() {
        this._videoEl.autoplay = true
    }

    get height() {
        return this._height
    }

    get width() {
        return this._width
    }

    async init(width: number = 640, height: number = 480) {
        if (!navigator.mediaDevices.getUserMedia) {
            throw new Error('Webcam not supported')
        }

        this._width = width
        this._height = height
        this._stream = await navigator.mediaDevices.getUserMedia({ video: true })
        this._videoEl.srcObject = this._stream
    }

    addFrameListener(listener: (frame: ImageData) => void) {
        this._frameListeners.push(listener)
    }

    removeFrameListener(listener: (frame: ImageData) => void) {
        const index = this._frameListeners.indexOf(listener)
        if (index !== -1) {
            this._frameListeners.splice(index, 1)
        }
    }

    start() {
        this._videoEl.play()
        this._videoEl.addEventListener('play', () => this._onPlay())
    }

    stop() {
        this._videoEl.pause()
        this._videoEl.srcObject = null
        this._stream?.getTracks().forEach(track => track.stop())
        this._frameListeners.length = 0
    }

    private _onPlay() {
        const canvas = new OffscreenCanvas(this.width, this.height);
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Canvas 2D context not supported')
        }

        requestAnimationFrame(() => this._drawFrame(context, canvas))
    }

    private _drawFrame(context: OffscreenCanvasRenderingContext2D, canvas: OffscreenCanvas) {
        context.drawImage(this._videoEl, 0, 0, this.width, this.height)
        const frame = context.getImageData(0, 0, this.width, this.height)
        this._frameListeners.forEach(listener => listener(frame))
        requestAnimationFrame(() => this._drawFrame(context, canvas))
    }
}

export default new Webcam()