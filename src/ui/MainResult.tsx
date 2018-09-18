import * as React from 'react';
import { observer } from 'mobx-react';

import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import { red, lightGreen, amber }  from '@material-ui/core/colors';

import { MouseEvent } from 'react';

import { namegen, AvailableStatus } from '../core';
// import ResultView from './ResultView';

import * as ReactGA from 'react-ga';

interface Styles {
    normalText: object;
    availableText: object;
    unavailableText: object;
    errorText: object;
}

const Styled = withStyles((theme) => ({
    normalText: {
        color: theme.palette.primary[500]
    },
    availableText: {
        color: lightGreen[500]
    },
    unavailableText: {
        color: red[500]
    },
    errorText: {
        color: amber[500]
    }
  }));

@observer
class MainResult extends React.Component<WithStyles<keyof Styles>> {
    domainCheckStatusText() {

        if (namegen.result) {
            switch (namegen.result.comDomainStatus) {
                case AvailableStatus.CHECKING:
                    return `Checking if ${namegen.result.text}.com is available..`;
                case AvailableStatus.AVAILABLE:
                    return `${namegen.result.text}.com is available! Click name to register..`;
                case AvailableStatus.UNAVAILABLE:
                    return `${namegen.result.text}.com is not available`;
                case AvailableStatus.ERROR:
                    return `Failed to get availability`;
                case AvailableStatus.UNKNOWN:
                    return '';
                default:
                    return '';
            }
        }

        return '';
    }

    domainCheckStatusStyle() {
        const { classes } = this.props;
        if (namegen.result) {
            switch (namegen.result.comDomainStatus) {
                case AvailableStatus.AVAILABLE:
                    return classes.availableText;
                case AvailableStatus.UNAVAILABLE:
                    return classes.unavailableText;
                case AvailableStatus.ERROR:
                    return classes.errorText;
                default:
                    return classes.normalText;
            }
        }

        return classes.normalText;
    }

    render() {
        return (
            <div style={{marginBottom: 20, minHeight: 130}}>
                <div>
                    <Typography
                        variant="display3"
                        // gutterBottom
                        // color="primary"
                        className={this.domainCheckStatusStyle()}
                        noWrap
                        onClick={this.handleClickText}
                        style={{ cursor: 'pointer', paddingRight: 10 }}
                    >
                        {namegen.result ? namegen.result.text : ''}
                    </Typography>
                </div>
                <Typography
                    variant="body2"
                    // color="secondary"
                    className={this.domainCheckStatusStyle()}
                >
                    {this.domainCheckStatusText()} &nbsp;
                </Typography>
            </div>
        );
    }

    handleClickText = (event: MouseEvent<HTMLElement>) => {
        if (namegen.result) {
            // Analytics
            ReactGA.event({
                category: 'Naming',
                action: 'Output',
                label: namegen.inputText + '_' + namegen.result.text
            });

            open(namegen.result.godaddySearchUrl);
        }
    }
}

export default Styled<{}>(MainResult);