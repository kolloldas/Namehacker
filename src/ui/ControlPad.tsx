import * as React from 'react';
import withStyles, { WithStyles } from 'material-ui/styles/withStyles';
import Button from 'material-ui/Button';
import ArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import Typography from 'material-ui/Typography';
import { /* observable, */ action } from 'mobx';
import { observer } from 'mobx-react';
import core, { namegen } from '../core';
import { MouseEvent } from 'react';
import { setTimeout, clearTimeout } from 'timers';

interface Styles {
    root: object;
    buttonFull: object;
    buttonSmall: object;
    helpText: object;
}

const Styled = withStyles((theme): Styles => ({
    root: {
        display: 'flex'
    },
    buttonSmall: {
        minWidth: 20,
        maxWidth: 30
    },
    buttonFull: {
        marginLeft: theme.spacing.unit,
        flexGrow: 1,
    },
    helpText: {
        marginTop: theme.spacing.unit
    }
}));

@observer
class ControlPad extends React.Component<WithStyles<keyof Styles>> {
    static readonly MIN_INTERVAL: number = 100;
    static readonly MAX_INTERVAL: number = 3000;
    static readonly MID_INTERVAL: number = (ControlPad.MAX_INTERVAL + ControlPad.MIN_INTERVAL) / 2;
    static readonly MS_PER_PIXEL: number = 10;

    interval: number = 0;
    startX: number = 0;
    mouseDownTs: number = 0;
    loopTimer: NodeJS.Timer;
    domainCheckTimer: NodeJS.Timer;
    isTimedCall: boolean = false;
    isMouseDown: boolean = false;

    componentDidMount() {
        addEventListener('mouseup', (ev) => this.handleMouseUpCommon());
    }

    componentWillUnmount() {
        removeEventListener('mouseup', (ev) => this.handleMouseUpCommon());
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
                <div className={classes.root}>
                    <Button
                        disabled={!namegen.showControls || !namegen.hasPrevious}
                        raised
                        color="primary"
                        onClick={this.handleClickPrev}
                        className={classes.buttonSmall}
                    >
                        <ArrowLeft />
                    </Button>
                    <Button
                        disabled={!namegen.showControls}
                        raised
                        color="primary"
                        onMouseDown={this.handleMouseDown}
                        onMouseUp={this.handleMouseUp}
                        onDragEnd={this.handleMouseUp}
                        onMouseMove={this.handleMouseMove}
                        className={classes.buttonFull}
                    >
                        Hack it!
                    </Button>
                </div>
                <div>
                    <Typography
                        type="body1"
                        color="secondary"
                        className={classes.helpText}
                    >
                        Tap and hold for continuous generation (Desktops only)
                    </Typography>
                </div>
            </div>
        );
    }

    @action
    handleClickPrev = (event: MouseEvent<HTMLElement>) => {
        core.previous();
        this.checkForDomain();
    }

    handleMouseDown = (event: MouseEvent<HTMLElement>) => {
        const ts = Date.now();
        const delta = ts - this.mouseDownTs;
        if (delta > ControlPad.MIN_INTERVAL) {
            this.mouseDownTs = ts;
            this.startX = event.clientX;
            this.startloopTimer();
        }
        this.cancelDomainCheck();
        this.isMouseDown = true;
        this.isTimedCall = false;
    }

    handleMouseMove = (event: MouseEvent<HTMLElement>) => {
        if (event.buttons === 1) {
            const offsetX = event.clientX - this.startX;
            this.interval = this.offset2Interval(-offsetX);
            // tslint:disable-next-line:no-console
            // console.log(this.interval);
        } else {
            this.interval = 0;
        }
    }

    handleMouseUp = (event: MouseEvent<HTMLElement>) => {
        this.handleMouseUpCommon();
    }

    handleMouseUpCommon = () => {
        if (this.isMouseDown) {
            if (this.loopTimer) {
                clearTimeout(this.loopTimer);
            }
            if (!this.isTimedCall) {
                core.predict();
            }
            this.interval = 0;
            this.checkForDomain();
            this.isMouseDown = false;
        }
    }

    offset2Interval(offsetPixels: number) {
        const offsetInterval = offsetPixels * ControlPad.MS_PER_PIXEL + ControlPad.MID_INTERVAL;
        return Math.min(Math.max(ControlPad.MIN_INTERVAL, offsetInterval), ControlPad.MAX_INTERVAL);
    }

    startloopTimer() {
        this.interval = this.offset2Interval(0);
        this.loopTimer = setTimeout(() => this.tick(), this.interval);
    }

    tick() {
        if (this.interval > 0) {

            core.predict();
            this.isTimedCall = true;
            this.loopTimer = setTimeout(() => this.tick(), this.interval);
        }
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
        }, 1000);
    }
}

export default Styled<{}>(ControlPad);