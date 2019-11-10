import React from 'react';
import { BehaviorSubject } from 'rxjs';

import './App.css';
import Footer from './Footer';
import Device from './Device';
import MagneticEncoderAlignment from './MagneticEncoderAlignment';
import { alive$, systemEvent$ } from './motionMasterClient';
import { MotionMasterMessage } from '@synapticon/motion-master-client';

window.deviceAddress$ = new BehaviorSubject(0);

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      alive: false,
      motionMasterState: '',
    };
  }

  componentDidMount() {
    alive$.subscribe(alive => this.setState({ alive }));

    systemEvent$.subscribe(systemEvent => {
      this.setState({ motionMasterState: MotionMasterMessage.Status.SystemEvent.State[systemEvent.state] });
    });
  }

  render() {

    const magneticEncoderAlignment = this.state.alive ? (
      <div className="row">
        <div className="col">
          <MagneticEncoderAlignment></MagneticEncoderAlignment>
        </div>
      </div>
    ) : null;

    return (
      <div className="container-fluid">

        <div className="row mt-3">
          <div className="col">
            <div className="alert alert-info mb-0 border" role="alert">
              <strong>Motion Master State</strong>: {this.state.motionMasterState}
            </div>
            <hr />
            <Device></Device>
          </div>
        </div>

        {magneticEncoderAlignment}

        <div className="row mb-3">
          <div className="col">
            <hr />
            <Footer></Footer>
          </div>
        </div>

      </div>
    );
  }
}

export default App;
