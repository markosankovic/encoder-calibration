import React from 'react';
import { alive$, getDeviceInfo } from './MotionMasterService';

class Device extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      alive: false,
      devices: [],
      selectedDeviceAddress: 0,
    };

    this.handleDeviceAddressChange = this.handleDeviceAddressChange.bind(this);
  }

  componentDidMount() {
    alive$.subscribe(alive => {
      this.setState({ alive });
      if (alive) {
        getDeviceInfo(deviceInfo => {
          const devices = deviceInfo.devices;
          if (devices && devices.length > 0) {
            const selectedDeviceAddress = devices[0].deviceAddress;
            this.setState({ devices, selectedDeviceAddress });
          } else {
            this.setState({ devices: [], selectedDeviceAddress: null });
          }
        });
      } else {
        this.setState({ devices: [], selectedDeviceAddress: null });
      }
    });
  }

  componentDidUpdate() {
    window.deviceAddress$.next(this.state.selectedDeviceAddress);
  }

  handleDeviceAddressChange(event) {
    this.setState({ selectedDeviceAddress: Number(event.target.value) });
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
          <div className="alert alert-warning mb-0 border" role="alert">
            You must <strong>connect devices</strong> before using this tool.
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
        </form>
        <hr></hr>
      </div>
    );
  };

}

export default Device;
