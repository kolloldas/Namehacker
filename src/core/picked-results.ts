import { observable, action } from 'mobx';
import { ResultItem } from './result-item';

class PickedResults {
    @observable items: Map<string, ResultItem>;

    constructor() {
        this.items = new Map();
    }

    @action 
    addItem(item: ResultItem) {
        this.items.set(item.text, item);
    }

    @action removeItem(item: ResultItem) {
        this.items.delete(item.text);
    }
}

export default new PickedResults();