import * as React from 'react';
import { MouseEvent } from 'react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import HelpIcon from 'material-ui-icons/Help';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';

import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

import * as ReactGA from 'react-ga';

const logo = require('../logo.svg');
const title = require('../namehacker.svg');

@observer
class Header extends React.Component {
    @observable dialogShown: boolean;
    render() {
        return (
            <div>
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <img 
                            src={logo} 
                            style={{ width: 25, height: 30, marginRight: 10 }} 
                            alt="logo" 
                        />
                        <div style={{flex: 1}}>
                            <img src={title} style={{ height: 20 }} alt="namehacker" />
                        </div>
                        <IconButton onClick={this.handleOpenHelp} style={{color: 'white'}}>
                            <HelpIcon/>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Dialog open={this.dialogShown} onRequestClose={this.handleCloseHelp}>
                    <DialogTitle>{'About'}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Name hacker is a neural network based name generator. It uses deeplearn.js 
                            to run inference directly on the browser. <br/><br/>
                            Enter a root word and keep hitting 'HACK IT' to generate new and wonderful names!
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCloseHelp} color="primary">
                            GOT IT
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

    @action
    handleCloseHelp = (event: MouseEvent<HTMLElement>) => {
        this.dialogShown = false;
    }

    @action
    handleOpenHelp = (event: MouseEvent<HTMLElement>) => {
        this.dialogShown = true;
        // Analytics
        ReactGA.event({
            category: 'UI',
            action: 'Open',
            label: 'App Help'
        });
    }
}

export default Header;