import React from 'react';

import motionMasterClient from './motionMasterClient';

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
    this.handleReloadDevicesClick = this.handleReloadDevicesClick.bind(this);
  }

  componentDidMount() {
    motionMasterClient.alive$.subscribe(alive => {
      this.setState({ alive });
      if (alive) {
        this.getDeviceInfo();
      } else {
        this.setState({ devices: [], selectedDeviceAddress: null, manufacturerSofwareVersion: '' });
      }
    });
  }

  componentDidUpdate() {
    window.deviceAddress$.next(this.state.selectedDeviceAddress);
  }

  handleReloadDevicesClick() {
    this.getDeviceInfo();
  }

  getDeviceInfo() {
    motionMasterClient.getDeviceInfo(deviceInfo => {
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
    motionMasterClient.getDeviceParameterValue(deviceAddress, { index: 0x100A, subindex: 0 }).subscribe(parameter => {
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
        <div>
          <div className="alert alert-warning mb-0 border" role="alert">
            You must <strong>connect to Motion Master</strong> before using this tool.
          </div>
          <hr />
        </div>
      );
    }

    if (this.state.devices.length === 0) {
      return (
        <div>
          <div className="alert alert-warning border d-flex align-items-center" role="alert">
            <span>You must <strong>connect devices</strong> before using this tool.</span>
            <button className="btn btn-outline-primary ml-3" onClick={this.handleReloadDevicesClick}>RELOAD DEVICES</button>
          </div>
          <hr />
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
        <hr></hr>
      </div>
    );
  };

}

export default Device;
