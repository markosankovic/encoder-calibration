import React from 'react';

import {
  alive$,
  getDeviceInfo,
  getDeviceParameterValue,
  systemEvent$,
} from './motionMasterClient';
import { MotionMasterMessage } from '@synapticon/motion-master-client';

class Device extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      alive: false,
      devices: [],
      selectedDeviceAddress: 0,
      manufacturerSofwareVersion: '',
    };

    this.handleDeviceAddressChange = this.handleDeviceAddressChange.bind(this);
  }

  componentDidMount() {
    alive$.subscribe(alive => {
      this.setState({ alive });
      if (alive) {
        this.getDeviceInfo();
      } else {
        this.setState({ devices: [], selectedDeviceAddress: null, manufacturerSofwareVersion: '' });
      }
    });

    systemEvent$.subscribe(systemEvent => {
      if (systemEvent.state === MotionMasterMessage.Status.SystemEvent.State.INITIALIZED) {
        this.getDeviceInfo();
      } else if (systemEvent.state === MotionMasterMessage.Status.SystemEvent.State.DEINITIALIZED) {
        this.setState({ devices: [], selectedDeviceAddress: null, manufacturerSofwareVersion: '' });
      }
    });
  }

  componentDidUpdate() {
    if (window.deviceAddress$.getValue() !== this.state.selectedDeviceAddress) {
      window.deviceAddress$.next(this.state.selectedDeviceAddress);
    }
  }

  getDeviceInfo() {
    getDeviceInfo(deviceInfo => {
      const devices = deviceInfo.devices;
      if (devices && devices.length > 0) {
        const selectedDeviceAddress = devices[0].deviceAddress;
        this.setState({ devices, selectedDeviceAddress });
        this.updateManufacturerSoftwareVersion(selectedDeviceAddress);
      } else {
        this.setState({ devices: [], selectedDeviceAddress: null, manufacturerSofwareVersion: '' });
      }
    });
  }

  handleDeviceAddressChange(event) {
    const selectedDeviceAddress = Number(event.target.value);
    this.setState({ selectedDeviceAddress });
    this.updateManufacturerSoftwareVersion(selectedDeviceAddress);
  }

  updateManufacturerSoftwareVersion(deviceAddress) {
    getDeviceParameterValue(deviceAddress, { index: 0x100A, subindex: 0 }).subscribe(parameter => {
      if (parameter) {
        this.setState({ manufacturerSofwareVersion: parameter.stringValue });
      } else {
        this.setState({ manufacturerSofwareVersion: '' });
      }
    });
  }

  render() {
    if (!this.state.alive) {
      return (
        <div className="alert alert-warning mb-0 border" role="alert">
          You must <strong>connect to Motion Master</strong> before using this tool.
        </div>
      );
    }

    if (this.state.devices.length === 0) {
      return (
        <div>
          <div className="alert alert-warning mb-0 border" role="alert">
            <span>You must <strong>connect devices</strong> before using this tool.</span>
          </div>
        </div>
      );
    }

    const options = this.state.devices.map(device => <option value={device.deviceAddress} key={device.deviceAddress}>{device.deviceAddress}</option>);
    options.unshift(<option value="" key=""></option>);

    return (
      <div>
        <form className="form-inline">
          <label className="mr-2" htmlFor="devicesSelect">Device</label>
          <select className="custom-select" id="devicesSelect" value={this.state.value} defaultValue={this.state.selectedDeviceAddress} onChange={this.handleDeviceAddressChange}>
            {options}
          </select>
          <div className="ml-2">{this.state.manufacturerSofwareVersion}</div>
        </form>
      </div>
    );
  };

}

export default Device;
