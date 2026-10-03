/**
 * 16-bit PCM WAV encoding of decoded audio.
 *
 * The original tool always re-encoded every source file to WAV with ffmpeg to
 * iron out inconsistent encodings; in the browser the Web Audio API decodes the
 * file and this writes the samples back out.
 */

/** The parts of an `AudioBuffer` the encoder reads. */
export interface PCMSource {
    numberOfChannels: number;
    sampleRate: number;
    length: number;
    getChannelData(channel: number): Float32Array;
}

const HEADER_BYTES = 44;
const BYTES_PER_SAMPLE = 2;

function writeASCII(view: DataView, offset: number, text: string): void {
    for (let index = 0; index < text.length; index++) {
        view.setUint8(offset + index, text.charCodeAt(index));
    }
}

/** Scale a float sample in [-1, 1] to a signed 16-bit integer, clipping outside it. */
export function floatToInt16(sample: number): number {
    const clipped = Math.max(-1, Math.min(1, sample));
    return clipped < 0 ? Math.round(clipped * 0x8000) : Math.round(clipped * 0x7fff);
}

export function encodeWAV(source: PCMSource): Uint8Array<ArrayBuffer> {
    const channels = source.numberOfChannels;
    const blockAlign = channels * BYTES_PER_SAMPLE;
    const dataBytes = source.length * blockAlign;
    const buffer = new ArrayBuffer(HEADER_BYTES + dataBytes);
    const view = new DataView(buffer);

    writeASCII(view, 0, "RIFF");
    view.setUint32(4, 36 + dataBytes, true);
    writeASCII(view, 8, "WAVE");
    writeASCII(view, 12, "fmt ");
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, channels, true);
    view.setUint32(24, source.sampleRate, true);
    view.setUint32(28, source.sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, BYTES_PER_SAMPLE * 8, true);
    writeASCII(view, 36, "data");
    view.setUint32(40, dataBytes, true);

    const channelData = Array.from({ length: channels }, (_, channel) => source.getChannelData(channel));
    let offset = HEADER_BYTES;
    for (let frame = 0; frame < source.length; frame++) {
        for (let channel = 0; channel < channels; channel++) {
            view.setInt16(offset, floatToInt16(channelData[channel][frame]), true);
            offset += BYTES_PER_SAMPLE;
        }
    }
    return new Uint8Array(buffer);
}
