import * as tf from '@tensorflow/tfjs-core';
import { TextEncoder, TextDecoder } from 'text-encoding';

const _SOS = 2;
const RESERVED = 3;

const MAX_LENGTH = 25;

export default class Model {

    private encoderLstmKernel: tf.Tensor2D;
    private encoderLstmBias: tf.Tensor1D;
    private decoderLstmKernel: tf.Tensor2D;
    private decoderLstmBias: tf.Tensor1D;

    private embedding: tf.Tensor2D;
    private outputDenseKernel: tf.Tensor2D;
    private outputDenseBias: tf.Tensor1D;

    private hiddenSize: number;
    private embeddingSize: number;

    private encoder: TextEncoder;
    private decoder: TextDecoder;

    constructor(vars: { [varName: string]: tf.Tensor }) {
    
        // Save the parameter variables
        this.encoderLstmKernel = vars['encoder/rnn/basic_lstm_cell/kernel'] as tf.Tensor2D;
        this.encoderLstmBias = vars['encoder/rnn/basic_lstm_cell/bias'] as tf.Tensor1D;
        this.decoderLstmKernel = vars['decoder/rnn/basic_lstm_cell/kernel'] as tf.Tensor2D;
        this.decoderLstmBias = vars['decoder/rnn/basic_lstm_cell/bias'] as tf.Tensor1D;
        // tslint:disable-next-line:no-string-literal
        this.embedding = vars['embedding'] as tf.Tensor2D;
        this.outputDenseKernel = vars['dense/kernel'] as tf.Tensor2D;
        this.outputDenseBias = vars['dense/bias'] as tf.Tensor1D;

        this.hiddenSize = this.encoderLstmKernel.shape[1] / 4;
        this.embeddingSize = this.embedding.shape[1];

        this.encoder = new TextEncoder('utf-8');
        this.decoder = new TextDecoder('utf-8');
    }

    async predict(input: string, noiseLevel: number = 0.5): Promise<string> {
        const query = this.encode(input.toLowerCase());
        let resultIds: tf.Scalar[] = [];

        resultIds = tf.tidy(() => {
            const forgetBias = tf.scalar(1.0);
            const innerResults: tf.Scalar[] = [];

            let [c, h] = this.zeroState(this.hiddenSize);

            // Encoder
            query.forEach(index => {

                const inputEncoderEmbed = tf.slice2d(this.embedding, [index, 0], [1, this.embeddingSize]);
                
                [c, h] = tf.basicLSTMCell(
                    forgetBias,
                    this.encoderLstmKernel,
                    this.encoderLstmBias,
                    inputEncoderEmbed,
                    c, h);

            });

            // Add noise
            const noiseC = tf.randomNormal([1, this.hiddenSize], 0, noiseLevel);
            const noiseH = tf.randomNormal([1, this.hiddenSize], 0, noiseLevel);

            c = tf.add(c, noiseC);
            h = tf.add(h, noiseH);

            let inputDecoder = tf.scalar(_SOS, 'int32');
            // Decoder
            for (let i = 0; i < MAX_LENGTH; i++) {
                const inputDecoderEmbed = tf.gather(
                    this.embedding, inputDecoder.as1D());

                [c, h] = tf.basicLSTMCell(
                    forgetBias,
                    this.decoderLstmKernel,
                    this.decoderLstmBias,
                    inputDecoderEmbed,
                    c, h);

                const logits = h.matMul(this.outputDenseKernel).add(this.outputDenseBias);
                const softmax = logits.as1D().softmax();
                let softmaxPower = softmax.square();
                softmaxPower = tf.div(softmaxPower, softmaxPower.sum());
                const result = tf.multinomial(softmaxPower, 1, Math.random(), true).asScalar();
                
                innerResults.push(result);
                inputDecoder = result;

            }

            return innerResults;
        });

        // tslint:disable-next-line:no-console
        // console.log('Tensors', tf.memory().numTensors);

        let results: number[] = [];

        for (let i = 0; i < resultIds.length; i++) {
            let idVal: Uint8Array = await resultIds[i].data() as Uint8Array;
            results.push(idVal[0]);

            resultIds[i].dispose();
        }

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
        }))).trim();
    }

    private zeroState(hiddenSize: number): [tf.Tensor2D, tf.Tensor2D] {
        return [
            tf.zeros([1, hiddenSize]),
            tf.zeros([1, hiddenSize])
        ];
    }
}