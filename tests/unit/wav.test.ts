import { encodeWAV, floatToInt16, type PCMSource } from "../../src/wav";

function source(channels: number[][], sampleRate = 44100): PCMSource {
    return {
        numberOfChannels: channels.length,
        sampleRate,
        length: channels[0].length,
        getChannelData: (channel) => Float32Array.from(channels[channel]),
    };
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
    return String.fromCharCode(...bytes.slice(start, start + length));
}

describe("floatToInt16", () => {
    test("scales and clips", () => {
        expect(floatToInt16(0)).toBe(0);
        expect(floatToInt16(1)).toBe(32767);
        expect(floatToInt16(-1)).toBe(-32768);
        expect(floatToInt16(2)).toBe(32767);
        expect(floatToInt16(-2)).toBe(-32768);
        expect(floatToInt16(0.5)).toBe(16384);
    });
});

describe("encodeWAV", () => {
    test("writes a canonical 16-bit PCM header", () => {
        const bytes = encodeWAV(
            source(
                [
                    [0, 0.5, -0.5],
                    [1, -1, 0],
                ],
                48000
            )
        );
        const view = new DataView(bytes.buffer);
        expect(ascii(bytes, 0, 4)).toBe("RIFF");
        expect(ascii(bytes, 8, 4)).toBe("WAVE");
        expect(ascii(bytes, 12, 4)).toBe("fmt ");
        expect(ascii(bytes, 36, 4)).toBe("data");
        expect(view.getUint16(20, true)).toBe(1);
        expect(view.getUint16(22, true)).toBe(2);
        expect(view.getUint32(24, true)).toBe(48000);
        expect(view.getUint32(28, true)).toBe(48000 * 4);
        expect(view.getUint16(32, true)).toBe(4);
        expect(view.getUint16(34, true)).toBe(16);
        expect(view.getUint32(40, true)).toBe(3 * 4);
        expect(view.getUint32(4, true)).toBe(36 + 12);
        expect(bytes.length).toBe(44 + 12);
    });

    test("interleaves channels", () => {
        const bytes = encodeWAV(
            source([
                [0, 1],
                [-1, 0.5],
            ])
        );
        const view = new DataView(bytes.buffer);
        const samples = [0, 1, 2, 3].map((index) => view.getInt16(44 + index * 2, true));
        expect(samples).toEqual([0, -32768, 32767, 16384]);
    });

    test("handles mono and empty audio", () => {
        expect(encodeWAV(source([[0.25]])).length).toBe(46);
        expect(encodeWAV(source([[]])).length).toBe(44);
    });
});
