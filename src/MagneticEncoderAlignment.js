import React from 'react';
import { Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import optimum from './optimum.svg';
import { calcAcGain, calcAfGain, furtherFromValue, getBiSSRegisterValue } from './MotionMasterService';

class MagneticEncoderAlignment extends React.Component {

  deviceAddressSubscription = new Subscription();

  constructor(props) {
    super(props);
    this.state = {
      deviceAddress: 0,
      measuredDistanceValue: 0,
      measureDistanceBtnDisabled: false,
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

  handleMeasureDistance() {
    this.setState({ measureDistanceBtnDisabled: true });
    getBiSSRegisterValue(this.state.deviceAddress, 0x2B).pipe(
      mergeMap(reg1 => getBiSSRegisterValue(this.state.deviceAddress, 0x2F).pipe(
        map(reg2 => [reg1, reg2]),
      ))
    ).subscribe(([reg1, reg2]) => {
      const afGainM = calcAfGain(reg1 & 0b00111);
      const acGainM = calcAcGain((reg1 >> 3) & 0b00011);
      const mVal = afGainM * acGainM;
      console.info(`reg1: ${reg1}, afGainM: ${afGainM}, acGainM: ${acGainM}, mVal: ${mVal}`);

      const afGainN = calcAfGain(reg2 & 0b00111);
      const acGainN = calcAcGain((reg2 >> 3) & 0b00011);
      const nVal = afGainN * acGainN;
      console.info(`reg2: ${reg2}, afGainN: ${afGainN}, acGainN: ${acGainN}, nVal: ${nVal}`);

      if (furtherFromValue(mVal, nVal, 58.5) >= 0) {
        this.setState({ measuredDistanceValue: mVal });
      } else {
        this.setState({ measuredDistanceValue: nVal });
      }

      this.setState({ measureDistanceBtnDisabled: false });
    });
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

    const tooCloseStyle = { width: '9%', backgroundColor: '#ffe59d' }; // 8.783
    const optimalStyle = { width: '23%', backgroundColor: '#94c47f' }; // 23.539
    const tooFarStyle = { width: '36%', backgroundColor: '#ffe59d' }; // 35.836
    const outOfRangeStyle = { width: '32%', backgroundColor: '#e99a9b' }; // 31.137
    const measuredDistanceBoxStyle = { left: `calc(${this.state.measuredDistanceValue / 284.625 * 100}% - 50px)` };
    // const measuredDistanceBoxStyle = { left: `calc(${Math.random() * 100}% - 50px)` };

    return (
      <div>
        <h5>Magnetic Encoder Alignment</h5>
        <p>To achieve the best result the magnetic disc must be mounted in the optimum distance to the sensor chip.</p>
        <img src={optimum} alt="Optimum distance to the sensor chip" />
        <div className="mt-3 px-5">
          <div className="position-relative mb-2">
            <div className="arrow_box measuredValueBox" style={measuredDistanceBoxStyle}>{this.state.measuredDistanceValue.toFixed(2)}</div>
          </div>
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
          <button type="button" className="btn btn-primary mt-3"
            onClick={this.handleMeasureDistance} disabled={this.state.measureDistanceBtnDisabled}>MEASURE DISTANCE</button>
        </div>
      </div>
    );
  };

}

export default MagneticEncoderAlignment;
