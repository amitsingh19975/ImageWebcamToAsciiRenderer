function rgbToBrightness(r: number, g: number, b: number): number {
    // Luminance (perceived option 1): (0.299*R + 0.587*G + 0.114*B)
    const sum = r * 0.299 + g * 0.587 + b * 0.114
    return sum / 255
}

function brightnessToAscii(brightness: number): string {
    const ascii = '@%#*+=-:. '.split('').reverse()
    return ascii[Math.floor(brightness * (ascii.length - 1))]
}

export function imageToAscii(imageData: ImageData, width: number, height: number): string {
    let asciiStr = ''
    for (let i = 0; i < height; i += 2) {
        for (let j = 0; j < width; j++) {
            const offset = (i * width + j) * 4
            const r = imageData.data[offset]
            const g = imageData.data[offset + 1]
            const b = imageData.data[offset + 2]
            const brightness = rgbToBrightness(r, g, b)
            asciiStr += brightnessToAscii(brightness)
        }
        asciiStr += '\n'
    }
    return asciiStr
}

export function fileToAscii(file: File, width: number, height: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const img = new Image()
            img.onload = () => {
                const canvas = new OffscreenCanvas(width, height)
                const context = canvas.getContext('2d')
                if (!context) {
                    reject(new Error('Canvas 2D context not supported'))
                    return
                }
                context.drawImage(img, 0, 0, width, height)
                const imageData = context.getImageData(0, 0, width, height)
                resolve(imageToAscii(imageData, width, height))
            }
            img.src = reader.result as string
        }
        reader.readAsDataURL(file)
    })
}