import { observable, action, useStrict, runInAction, computed } from 'mobx';
import * as tf from '@tensorflow/tfjs-core';
import Model from './model';
import { ResultItem } from './result-item';

import * as ReactGA from 'react-ga';

useStrict(true);
enum State {
    INIT,
    LOADING,
    READY,
    ERROR
}

class NameGenerator {
    private static readonly PATTERN = /[^0-9a-zA-Z\-]+$/;
    @observable results: Array<ResultItem> = [];
    @observable state: State = State.INIT;
    @observable inputText: string;

    private model: Model;
    private tracker: Set<string>;
    private newInput: boolean;

    constructor() {
        // this.loadModel();
        this.tracker = new Set();
    }

    @computed
    get isLoading(): boolean {
        return this.state === State.LOADING;
    }

    @computed
    get isReady(): boolean {
        return this.state === State.READY;
    }

    @computed
    get isError(): boolean {
        return this.state === State.ERROR;
    }

    @computed
    get showControls(): boolean {
        return !!this.inputText && this.inputText.length >= 3;
    }

    @computed
    get hasPrevious(): boolean {
        return !!this.results && this.results.length > 1;
    }

    @computed
    get result(): ResultItem | null {
        return this.results.length > 0 ? this.results[this.results.length - 1] : null;
    }

    @action
    async loadModel() {
        this.state = State.LOADING;
        try {
            const response = await fetch('./data/weights_manifest.json');
            const manifest = await response.json();
            const vars = await tf.io.loadWeights(manifest, './data');

            runInAction(() => {
                // tslint:disable-next-line:no-console
                console.log('Model loaded');
                this.model = new Model(vars);
                // Crank the model
                this.model.predict('');
                this.state = State.READY;
            });

        } catch (error) {
            runInAction(() => {
                // tslint:disable-next-line:no-console
                console.log('Failed to load model: ' + error);
                this.state = State.ERROR;
            });
        }
    }

    @action
    updateInput(text: string) {
        this.inputText = text;
        this.newInput = true;
    }

    @action
    async predict() {
        if (this.state === State.READY) {
            if (this.inputText && this.inputText.length >= 3) {
                let result = await this.model.predict(this.inputText);
                
                if (!this.isResultValid(result) || this.tracker.has(result)) {
                    for (let i = 0; i < 10; i++) {
                        result = await this.model.predict(this.inputText);
                        if (this.isResultValid(result) && !this.tracker.has(result)) {
                            break;
                        }
                    }
                }

                runInAction(() => {
                    this.results.push(new ResultItem(result));
                    this.tracker.add(result);

                    // Analytics
                    if (this.newInput) {
                        this.newInput = false;
                        ReactGA.event({
                            category: 'Naming',
                            action: 'Input',
                            label: this.inputText
                        });
                    }
                });
            } else {
                this.results.length = 0;
                this.tracker.clear();
            }
        }
    }

    @action
    previous() {
        if (this.results.length > 1) {
            const result = this.results.pop(); 
            if (result && this.tracker.has(result.text)) {
                this.tracker.delete(result.text);
            }
        }

    }

    private isResultValid(s: string): boolean {
        if (!s || s.length > 18 || s.length < 3) {
            return false;
        }

        if (NameGenerator.PATTERN.test(s)) {
            return false;
        }

        return true;
    }
}

export default new NameGenerator();
