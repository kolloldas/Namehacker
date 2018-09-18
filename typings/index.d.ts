
declare namespace TextEncoding {
    class TextDecoder {
        constructor(encoding: string);

        decode(buffer: Uint8Array): string;
    }

    class TextEncoder {
        constructor(encoding: string);

        encode(s: string): Uint8Array;
    }
}

declare module "text-encoding" {
    export = TextEncoding;
}