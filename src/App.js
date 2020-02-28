import React from 'react';
import { BehaviorSubject } from 'rxjs';
import { MotionMasterMessage } from '@synapticon/motion-master-client';
import ordinal from 'ordinal';

import './App.css';
import Footer from './Footer';
import Device from './Device';
import MagneticEncoderAlignment from './MagneticEncoderAlignment';
import { alive$, systemEvent$ } from './motionMasterClient';
import { NarrowAngleCalibration } from './NarrowAngleCalibration';

window.deviceAddress$ = new BehaviorSubject(0);

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      alive: false,
      motionMasterState: '',
      ports: 2,
    };

    this.incPorts = this.incPorts.bind(this);
    this.decPorts = this.decPorts.bind(this);
  }

  componentDidMount() {
    alive$.subscribe(alive => this.setState({ alive }));
    systemEvent$.subscribe(systemEvent => this.setState({ motionMasterState: MotionMasterMessage.Status.SystemEvent.State[systemEvent.state] }));
  }

  incPorts() {
    this.setState({ ports: this.state.ports === 9 ? 9 : this.state.ports + 1 });
  }

  decPorts() {
    this.setState({ ports: this.state.ports === 1 ? 1 : this.state.ports - 1 });
  }

  render() {

    const motionMasterState = this.state.motionMasterState ? (
      <div>
        <div className="alert alert-info mb-0 border" role="alert">
          <strong>Motion Master State</strong>: {this.state.motionMasterState}
        </div>
        <hr />
      </div>
    ) : null;

    let actions;
    let encoders;

    if (this.state.alive) {

      actions = (
        <div className="row mb-3">
          <div className="col d-flex align-items-center">
            <div>NUMBER OF PORTS:</div>
            <button type="button" className="btn btn-outline-success ml-3" onClick={this.incPorts}>INC</button>
            <button type="button" className="btn btn-outline-danger ml-1" onClick={this.decPorts}>DEC</button>
          </div>
        </div>
      );

      encoders = Array(this.state.ports).fill().map((_, i) => (
        <div className="row encoder mb-4" key={i}>
          <div className="col">
            <h5>{ordinal(i + 1)} ENCODER PORT</h5>
            <MagneticEncoderAlignment encoderPort={i}></MagneticEncoderAlignment>
            <NarrowAngleCalibration encoderPort={i}></NarrowAngleCalibration>
          </div>
        </div>
      ))
    }

    return (
      <div className="container-fluid">
        <div className="row mt-3">
          <div className="col">
            {motionMasterState}
            <Device></Device>
          </div>
        </div>


        <hr />

        {actions}

        {encoders}

        <hr />

        <div className="row mb-3">
          <div className="col">
            <Footer></Footer>
          </div>
        </div>

      </div>
    );
  }
}

export default App;
