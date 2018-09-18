import * as React from 'react';
import { observer } from 'mobx-react';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { withStyles, WithStyles, createStyles } from '@material-ui/core';

import core from './core';

import Header from './ui/Header';
import TextInput from './ui/TextInput';
import MainResult from './ui/MainResult';
import ControlPad from './ui/ControlPad';
// import PickedResultsView from './ui/PickedResultsView';

import * as ReactGA from 'react-ga';

const styles = createStyles({
  top: {
    flexGrow: 1,
    marginTop: 30,
    padding: 10
  },
  content: {
    padding: 20,
  }
});

interface Props extends WithStyles<typeof styles> {}

@observer
class App extends React.Component<Props> {

  componentDidMount() {
    core.loadModel();

    // Analytics
    ReactGA.initialize('UA-110092701-1');
    ReactGA.pageview(window.location.pathname);
  }

  showLoader() {
    if (core.isLoading) {
      return (
        <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
            <CircularProgress/>
          <div>
            <Typography variant="body1" color="textSecondary" align="center">
              Loading my brain..
            </Typography>
          </div>
        </div>
      );
    } else if (core.isError) {
      return (
        <Typography variant="body1" color="textSecondary" align="center">
          Failed to load my brain
        </Typography>
      );
    } else {
      return null;
    }
  }

  showContent() {
    if (core.isReady) {
      const { classes } = this.props;
      return (
        <Paper className={classes.content}>
          <TextInput />
          <MainResult />
          <ControlPad />
        </Paper>
      );
    } else {
      return null;
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div className="full-height">
        <div className="page-wrap">
        <Header />
        <Grid container className={classes.top} justify="center">
          <Grid item xs={12} sm={8} lg={6}>
            {this.showLoader()}
            {this.showContent()}
          </Grid>
        </Grid>
        </div>
        <footer className="site-footer">
          <Typography variant="body1" color="textSecondary" align="center">
            © Kollol Das 2018
          </Typography>
        </footer>
      </div>
    );
  }
}

export default withStyles(styles)(App);
