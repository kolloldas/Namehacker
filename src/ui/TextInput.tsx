import * as React from 'react';

import { withStyles, WithStyles, createStyles } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import TextField from '@material-ui/core/TextField';

import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

import { namegen } from '../core';
import { ChangeEvent } from 'react';
import { setTimeout, clearTimeout } from 'timers';

const styles = (theme: Theme) => createStyles({
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: '90%',
      },
  });

interface Props extends WithStyles<typeof styles> {}

@observer
class TextInput extends React.Component<Props> {
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

export default withStyles(styles)(TextInput);