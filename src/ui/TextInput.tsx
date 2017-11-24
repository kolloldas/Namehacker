import * as React from 'react';

import withStyles, { WithStyles } from 'material-ui/styles/withStyles';
import TextField from 'material-ui/TextField';

import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

import { namegen } from '../core';
import { ChangeEvent } from 'react';
import { setTimeout, clearTimeout } from 'timers';

interface Styles {
    textField: object;
}

const Styled = withStyles((theme): Styles => ({
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: '90%',
      },
  }));

@observer
class TextInput extends React.Component<WithStyles<keyof Styles>> {
    domainCheckTimer: NodeJS.Timer;

    @observable curInput: string = '';
    render() {
        // const { classes } = this.props;
        return (
            <div>
                <TextField 
                    id="userInput"
                    label="Enter a root word"
                    helperText="Type at least 3 characters"
                    value={this.curInput} 
                    onChange={this.handleChange}
                    margin="normal"
                    fullWidth
                />
            </div>
        );
    }
    @action
    handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.curInput = event.target.value;  
        namegen.updateInput(this.curInput); 
        // namegen.predict();
        // this.checkForDomain();
    }

    cancelDomainCheck() {
        if (this.domainCheckTimer) {
            clearTimeout(this.domainCheckTimer);
        }
    }

    checkForDomain() {
        if (this.domainCheckTimer) {
            clearTimeout(this.domainCheckTimer);
        }

        this.domainCheckTimer = setTimeout(() => {
            if (namegen.result) {
                namegen.result.checkDomainAvailability();
            }
        // tslint:disable-next-line:align
        }, 2000);
    }
}

export default Styled<{}>(TextInput);