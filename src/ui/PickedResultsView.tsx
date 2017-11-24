import * as React from 'react';
import { observer } from 'mobx-react';
import { picked } from '../core';
import ResultView from './ResultView';

@observer
class PickedResultsView extends React.Component {
    makeItems() {
        return Array.from(picked.items.values())
        .map((item) => {
            return (
                <ResultView item={item} key={item.text} hasDelete={true}/>
            );
        });
    }
    render() {
        return (
            <div>
                <h4>Picked Names</h4>
                <ul>
                    {this.makeItems()}
                </ul>
            </div>
        );
    }
}

export default PickedResultsView;