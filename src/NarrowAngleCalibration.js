import React from 'react';
import { Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { MotionMasterMessage } from '@synapticon/motion-master-client';

import { motionMasterClient } from './motionMasterClient';

export class NarrowAngleCalibration extends React.Component {

  deviceAddressSubscription = new Subscription();

  constructor(props) {
    super(props);
    this.state = {
      deviceAddress: 0,
      calibrationProcedureStatus: {},
    };

    this.handleStartNarrowAngleCalibration = this.handleStartNarrowAngleCalibration.bind(this);
    this.handleStartCalibrationProcedure = this.handleStartCalibrationProcedure.bind(this);
    this.handleQuickStop = this.handleQuickStop.bind(this);
  }

  componentDidMount() {
    this.deviceAddressSubscription = window.deviceAddress$.subscribe(deviceAddress => this.setState({ deviceAddress }));
  }

  componentWillUnmount() {
    this.deviceAddressSubscription.unsubscribe();
  }

  handleStartNarrowAngleCalibration() {
    motionMasterClient.requestStartNarrowAngleCalibration(this.state.deviceAddress);
  }

  handleStartCalibrationProcedure() {
    motionMasterClient.requestStartCirculoEncoderNarrowAngleCalibrationProcedure(this.state.deviceAddress, this.props.encoderPort).pipe(
      takeWhile(status => {
        return (status.success && status.success !== MotionMasterMessage.Status.CirculoEncoderNarrowAngleCalibrationProcedure.Success.Code.DONE) || !status.error;
      }, true),
    ).subscribe(calibrationProcedureStatus => {
      console.info(calibrationProcedureStatus);
      this.setState({ calibrationProcedureStatus });
    });
  }

  handleQuickStop() {
    motionMasterClient.requestStopDevice(this.state.deviceAddress);
  }

  render() {
    if (!this.state.deviceAddress) {
      return (
        <div className="alert alert-warning mb-0 border" role="alert">
          You must <strong>select a device</strong> before running Narrow Angle Calibration Procedure.
        </div>
      );
    }

    return (
      <div>
        <div className="d-flex mt-3 px-5">
          {/* <button className="btn btn-primary" onClick={this.handleStartNarrowAngleCalibration}>START NARROW ANGLE CALIBRATION</button> */}
          <button className="btn btn-danger mr-2" onClick={this.handleQuickStop}>QUICK STOP</button>
          <button className="btn btn-primary mr-2" onClick={this.handleStartCalibrationProcedure}>START CALIBRATION PROCEDURE</button>
          <span className="p-2"><code>{JSON.stringify(this.state.calibrationProcedureStatus)}</code></span>
        </div>
      </div>
    );
  }
}
