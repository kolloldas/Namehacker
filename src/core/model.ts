import { Array1D, Array2D, NDArray, NDArrayMath, NDArrayMathCPU, NDArrayMathGPU, Scalar, /* util */ } from 'deeplearn';
import { TextEncoder, TextDecoder } from 'text-encoding';

const _PAD = 0;
const _EOS = 1;
const _SOS = 2;
const RESERVED = 3;

// const VOCAB_SIZE = 256;
const MAX_LENGTH = 25;

export default class Model {

    private encoderLstmKernel: Array2D;
    private encoderLstmBias: Array1D;
    private decoderLstmKernel: Array2D;
    private decoderLstmBias: Array1D;

    private embedding: Array2D;
    private outputDenseKernel: Array2D;
    private outputDenseBias: Array1D;

    private hiddenSize: number;
    private embeddingSize: number;

    private math: NDArrayMath;

    private encoder: TextEncoder;
    private decoder: TextDecoder;

    constructor(vars: { [varName: string]: NDArray }) {
        this.math = this.getMathHandler(); // Temporary hack

        // Save the parameter variables
        this.encoderLstmKernel = vars['encoder/rnn/basic_lstm_cell/kernel'] as Array2D;
        this.encoderLstmBias = vars['encoder/rnn/basic_lstm_cell/bias'] as Array1D;
        this.decoderLstmKernel = vars['decoder/rnn/basic_lstm_cell/kernel'] as Array2D;
        this.decoderLstmBias = vars['decoder/rnn/basic_lstm_cell/bias'] as Array1D;
        // tslint:disable-next-line:no-string-literal
        this.embedding = vars['embedding'] as Array2D;
        this.outputDenseKernel = vars['dense/kernel'] as Array2D;
        this.outputDenseBias = vars['dense/bias'] as Array1D;

        this.hiddenSize = this.encoderLstmKernel.shape[1] / 4;
        this.embeddingSize = this.embedding.shape[1];

        this.encoder = new TextEncoder('utf-8');
        this.decoder = new TextDecoder('utf-8');
    }

    async predict(input: string, noiseLevel: number = 0.5): Promise<string> {
        const query = this.encode(input.toLowerCase());
        const results: number[] = [];
        await this.math.scope(async (keep, track) => {
            const forgetBias = track(Scalar.new(1.0));

            let initialState = this.zeroState(this.hiddenSize);
            let c = track(initialState[0]);
            let h = track(initialState[1]);

            // Encoder
            query.forEach(index => {
                const inputEncoderEmbed = this.math.slice2D(this.embedding, [index, 0], [1, this.embeddingSize]);
                [c, h] = this.math.basicLSTMCell(
                    forgetBias,
                    this.encoderLstmKernel,
                    this.encoderLstmBias,
                    inputEncoderEmbed,
                    c, h);

            });

            // Add noise
            const noiseC = track(Array2D.randNormal([1, this.hiddenSize], 0, noiseLevel));
            const noiseH = track(Array2D.randNormal([1, this.hiddenSize], 0, noiseLevel));

            c = this.math.add(c, track(noiseC)) as Array2D;
            h = this.math.add(h, track(noiseH)) as Array2D;

            let inputDecoder = _SOS;
            // Decoder
            for (let i = 0; i < MAX_LENGTH; i++) {
                const inputDecoderEmbed = this.math.slice2D(
                    this.embedding, [inputDecoder, 0],
                    [1, this.embeddingSize]);
                [c, h] = this.math.basicLSTMCell(
                    forgetBias,
                    this.decoderLstmKernel,
                    this.decoderLstmBias,
                    inputDecoderEmbed,
                    c, h);
                const output = this.math.matMul(h, this.outputDenseKernel);
                const logits = this.math.add(output, this.outputDenseBias);
                // const result = await this.math.argMax(logits).val();

                const softmax = this.math.softmax(logits.as1D());
                let softmaxPower = this.math.square(softmax);
                softmaxPower = this.math.arrayDividedByScalar(softmaxPower, this.math.sum(softmaxPower));
                const result = await this.math.multinomial(softmaxPower, 1).asScalar().val();

                if (result === _EOS || result === _PAD) {
                    break;
                }

                results.push(result);
                inputDecoder = result;
            }

        });

        return this.decode(results);
    }

    private encode(s: string): Uint8Array {
        return this.encoder.encode(s)
            .map((index: number): number => {
                return index + RESERVED;
            });
    }

    private decode(a: number[]): string {
        return this.decoder.decode(new Uint8Array(a.map((index: number): number => {
            if (index <= RESERVED) {
                return 32; // Space
            } else {
                return index - RESERVED;
            }
        })));
    }

    private zeroState(hiddenSize: number): [Array2D] {
        return [
            Array2D.zeros([1, hiddenSize]),
            Array2D.zeros([1, hiddenSize])
        ];
    }

    private getMathHandler(): NDArrayMath {
        if ( navigator.userAgent.match('Edge') || navigator.vendor.match('Apple')) {
            // tslint:disable-next-line:no-console
            console.log('Using CPU');
            return new NDArrayMathCPU();
        } else {
            // tslint:disable-next-line:no-console
            console.log('Using GPU');
            return new NDArrayMathGPU();
        }
    }
}