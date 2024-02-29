import { fileToAscii, imageToAscii } from './ascii';
import webcam from './webcam';

const uploadTabEl = document.querySelector<HTMLAnchorElement>('a[href="#upload"]');
const webcamTabEl = document.querySelector<HTMLAnchorElement>('a[href="#webcam"]');
const uploadSection = document.getElementById('upload') as HTMLDivElement | null
const webcamSection = document.getElementById('webcam') as HTMLDivElement | null
const errorSection = document.getElementById('error') as HTMLDivElement | null
const errorMessageEl = errorSection?.lastChild as HTMLDivElement | null

function hideAllSections() {
    if (uploadSection) uploadSection.setAttribute('hidden', '')
    if (webcamSection) webcamSection.setAttribute('hidden', '')
    if (errorSection) errorSection.setAttribute('hidden', '')
}

function errorToString(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    } else if (typeof error === 'string') {
        return error
    } else {
        return JSON.stringify(error)
    }
}

function onError(error: unknown) {
    hideAllSections();

    const message = errorToString(error)
    if (!message) {
        handleActiveTab()
        return
    }

    if (!errorSection || !errorMessageEl) return
    errorSection.removeAttribute('hidden')
    errorMessageEl.textContent = message
}

function getCurrentHash(): string | undefined {
    const hash = window.location.hash
    if (!hash) return undefined
    const link = hash.slice(1)
    if (!link) return undefined
    return link
}

async function onWebcamStart() {
    if (!webcamSection) return
    const preEl = webcamSection.querySelector('pre')
    if (!preEl) return
    preEl.textContent = 'Loading...'

    try {
        await webcam.init(400, 300)
        preEl.style.fontSize = `${3}px`;
        webcam.start()
        webcam.addFrameListener((frame) => {
            const asciiStr = imageToAscii(frame, webcam.width, webcam.height)
            preEl.textContent = asciiStr
        })

        const webcamStartButton = webcamSection.querySelector<HTMLButtonElement>('button')!;
        webcamStartButton.textContent = 'Stop'
        webcamStartButton.onclick = async () => {
            webcam.stop()
            preEl.textContent = ''
            webcamStartButton.textContent = 'Start'
            webcamStartButton.onclick = onWebcamStart
        }

    } catch (error) {
        onError(error)
    }
}

async function onWebcamInit() {
    uploadSection?.setAttribute('hidden', '')
    if (!webcamSection) return
    webcamSection.removeAttribute('hidden')
    const webcamStartButton = webcamSection.querySelector<HTMLButtonElement>('button')
    if (!webcamStartButton) return

    webcamStartButton.onclick = onWebcamStart
}

async function onConvertButtonClick() {
    const preEl = uploadSection!.querySelector('pre')
    if (!preEl) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
        try {
            const file = input.files?.[0]
            if (!file) {
                onError('No file selected')
                return
            }
            preEl.textContent = 'Loading...'
            const asciiStr = await fileToAscii(file, 400, 300)
            preEl.textContent = asciiStr
            preEl.style.fontSize = `${3}px`;
        } catch (error) {
            onError(error)
        }
    }
    input.click()
}

function onUploadInit() {
    webcamSection?.setAttribute('hidden', '')
    if (!uploadSection) return
    uploadSection.removeAttribute('hidden')
    const button = uploadSection.querySelector('button')
    if (!button) return
    
    const preEl = uploadSection.querySelector('pre')
    if (!preEl) return

    
    button.onclick = onConvertButtonClick
}

function handleActiveTab() {
    const hash = getCurrentHash();
    errorSection?.setAttribute('hidden', '')
    webcam.stop()

    if (hash === 'upload') {
        uploadTabEl?.classList.add('active')
        webcamTabEl?.classList.remove('active')
        onUploadInit();
    } else if (hash === 'webcam') {
        webcamTabEl?.classList.add('active')
        uploadTabEl?.classList.remove('active')
        onWebcamInit();
    } else {
        window.location.hash = 'webcam'
    }
}

function onHashChange() {
    handleActiveTab()
}

function main() {
    window.addEventListener('hashchange', onHashChange)
    handleActiveTab()
}

main()
