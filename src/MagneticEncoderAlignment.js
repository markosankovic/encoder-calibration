import React from 'react';
import { Subscription } from 'rxjs';
import optimum from './optimum.svg';

class MagneticEncoderAlignment extends React.Component {

  deviceAddressSubscription = new Subscription();

  constructor(props) {
    super(props);
    this.state = {
      deviceAddress: 0,
      measuredDistanceValue: 0,
    };

    this.handleMeasureDistance = this.handleMeasureDistance.bind(this);
  }

  componentDidMount() {
    this.deviceAddressSubscription = window.deviceAddress$.subscribe(deviceAddress => {
      this.setState({ deviceAddress });
    });
  }

  componentWillUnmount() {
    this.deviceAddressSubscription.unsubscribe();
  }

  handleMeasureDistance(event) {
    alert('Not yet implemented!');
  }

  render() {
    if (!this.state.deviceAddress) {
      return (
        <div>
          <div className="alert alert-warning mb-0 border" role="alert">
            You must <strong>select a device</strong> before calibrating encoder.
          </div>
          <hr />
        </div>
      );
    }

    const tooCloseStyle = { width: '10%', 'background-color': '#ffe59d' };
    const optimalStyle = { width: '27%', 'background-color': '#94c47f' };
    const tooFarStyle = { width: '41%', 'background-color': '#ffe59d' };
    const outOfRangeStyle = { width: '22%', 'background-color': '#e99a9b' };

    return (
      <div>
        <h5>Magnetic Encoder Alignment</h5>
        <p>To achieve the best result the magnetic disc must be mounted in the optimum distance to the sensor chip.</p>
        <img src={optimum} alt="Optimum distance to the sensor chip" />
        <div className="mt-3">
          <p><strong>Measured distance</strong>: <span>{this.state.measuredDistanceValue}</span></p>
          <input type="range" className="w-100" name="measuredDistance" value={this.state.measuredDistanceValue} min="0" max="250" />
          <div className="d-flex text-center w-100 mt-1">
            <div style={tooCloseStyle}>
              <div className="py-2 px-1">TOO CLOSE</div>
            </div>
            <div className="text-white" style={optimalStyle}>
              <div className="py-2 px-1">OPTIMAL</div>
            </div>
            <div style={tooFarStyle}>
              <div className="py-2 px-1">TOO FAR</div>
            </div>
            <div className="text-white" style={outOfRangeStyle}>
              <div className="py-2 px-1">OUT OF RANGE</div>
            </div>
          </div>
          <button type="button" className="btn btn-primary mt-3" onClick={this.handleMeasureDistance}>MEASURE DISTANCE</button>
        </div>
      </div>
    );
  };

}

export default MagneticEncoderAlignment;
