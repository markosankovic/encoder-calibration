import React from 'react';
import { Subscription } from 'rxjs';

import { motionMasterClient } from './motionMasterClient';

export class NarrowAngleCalibration extends React.Component {

  deviceAddressSubscription = new Subscription();

  constructor(props) {
    super(props);
    this.state = {
      deviceAddress: 0,
    };

    this.handleStartNarrowAngleCalibration = this.handleStartNarrowAngleCalibration.bind(this);
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
        <h5>Narrow Angle Calibration Procedure</h5>
        <div className="d-flex mt-3 px-5">
          <button className="btn btn-primary" onClick={this.handleStartNarrowAngleCalibration}>START NARROW ANGLE CALIBRATION</button>
          <button className="btn btn-danger ml-2" onClick={this.handleQuickStop}>QUICK STOP</button>
        </div>
      </div>
    );
  }
}
