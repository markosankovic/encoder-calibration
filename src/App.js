import React from 'react';
import { BehaviorSubject } from 'rxjs';
import isElectron from 'is-electron';

import './App.css';
import Connect from './Connect';
import Footer from './Footer';
import Device from './Device';
import MagneticEncoderAlignment from './MagneticEncoderAlignment';
import motionMasterClient from './motionMasterClient';
import { zmqBind } from './zmq';
import { wssBind } from './wss';

isElectron() ? zmqBind() : wssBind();

window.deviceAddress$ = new BehaviorSubject(0);

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      alive: false,
    };
  }

  componentDidMount() {
    motionMasterClient.alive$.subscribe(alive => this.setState({ alive }));
  }

  render() {

    const connect = isElectron() ? (
      <div className="row py-3 mb-3 bg-white border-bottom">
        <div className="col">
          <Connect></Connect>
        </div>
      </div>
    ) : null;


    const magneticEncoderAlignment = this.state.alive ? (
      <div className="row">
        <div className="col">
          <MagneticEncoderAlignment></MagneticEncoderAlignment>
        </div>
      </div>
    ) : null;

    return (
      <div className="container-fluid">

        {connect}

        <div className="row">
          <div className="col">
            <Device></Device>
          </div>
        </div>

        {magneticEncoderAlignment}

        <div className="row mb-3">
          <div className="col">
            <hr></hr>
            <Footer></Footer>
          </div>
        </div>

      </div>
    );
  }
}

export default App;
