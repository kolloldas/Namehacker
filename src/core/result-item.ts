import { observable, computed, action, runInAction } from 'mobx';
// import { setTimeout } from 'timers';
import axios from 'axios';

export enum AvailableStatus {
    UNKNOWN,
    CHECKING,
    AVAILABLE,
    UNAVAILABLE,
    ERROR
}

export class ResultItem {
    text: string;
    @observable domains: Map<string, AvailableStatus>;

    constructor(resultText: string) {
        this.text = resultText;
        this.domains = new Map();
        this.domains.set('.com', AvailableStatus.UNKNOWN);
    }

    @computed
    get comDomainStatus(): AvailableStatus {
        return this.domains.get('.com') || AvailableStatus.UNKNOWN;
    }

    get googleSearchUrl(): string {
        return `https://www.google.co.in/search?q=${this.text}`;
    }

    get godaddySearchUrl(): string {
        return `https://godaddy.com/domains/searchresults.aspx?checkAvail=1&tmskey=&domainToCheck=${this.text}`;
    }

    @action
    modifyText(text: string) {
        this.text = text;
    }

    @action
    async checkDomainAvailability(ext: string = '.com') {
        
        if (process.env.REACT_APP_DOMAIN_CHECK_URL &&
            (this.domains.get(ext) === AvailableStatus.UNKNOWN || 
            this.domains.get(ext) === AvailableStatus.ERROR)) {
            this.domains.set(ext, AvailableStatus.CHECKING);
            const domain = this.text.replace('\'', '').replace('.com', '');

            try {
                const res = await axios(process.env.REACT_APP_DOMAIN_CHECK_URL + 
                                        `?domain=${domain}${ext}`);
                
                // tslint:disable-next-line:no-console
                // console.log(res.data);
                runInAction(() => {
                    const { available } = res.data;
                    this.domains.set(ext, available ? AvailableStatus.AVAILABLE : AvailableStatus.UNAVAILABLE);
                });
            } catch (error) {
                runInAction(() => {
                    this.domains.set(ext, AvailableStatus.ERROR);
                });
            }
        }
    }
}