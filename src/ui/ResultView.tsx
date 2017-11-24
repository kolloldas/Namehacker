import * as React from 'react';
import { observer } from 'mobx-react';
import { ResultItem } from '../core/result-item';
import { picked, AvailableStatus } from '../core';
import { MouseEvent } from 'react';

export interface Props {
    item: ResultItem;
    hasPick?: boolean;
    hasDelete?: boolean;
}

@observer
class ResultView extends React.Component<Props, object> {
    domainCheckStatus() {
        // tslint:disable-next-line:no-console
        // console.log('domainCheckStatus(): ' + this.props.item.comDomainStatus );
        switch (this.props.item.comDomainStatus) {
            case AvailableStatus.CHECKING:
                return 'Checking...';
            case AvailableStatus.AVAILABLE:
                return 'Available';
            case AvailableStatus.UNAVAILABLE:
                return 'Unavailable';
            case AvailableStatus.UNKNOWN:
                return (
                    <button onClick={this.handleClickCheckDomain}>Check</button>
                );
            default:
                return null;
        }
    }
    render() {
        const { item, hasPick, hasDelete } = this.props;
        return (
            <div>
                {item.text} &nbsp;
                {hasPick ? <button onClick={this.handleClickPick}>+</button> : null}
                {hasDelete ? <button onClick={this.handleClickDelete}>x</button> : null}
                &nbsp;
                {this.domainCheckStatus()}
            </div>
        );
    }
    handleClickCheckDomain = (event: MouseEvent<HTMLElement>) => {
        this.props.item.checkDomainAvailability();
    }

    handleClickPick = (event: MouseEvent<HTMLElement>) => {
        this.props.item.checkDomainAvailability();
        picked.addItem(this.props.item);
    }

    handleClickDelete = (event: MouseEvent<HTMLElement>) => {
        picked.removeItem(this.props.item);
    }
}

export default ResultView;