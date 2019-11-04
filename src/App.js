import React from 'react';
import optimum from './optimum.svg';
import './App.css';
import Connect from './Connect';
import Footer from './Footer';

function App() {
  return (
    <div className="container-fluid">

      <div className="row py-3 mb-3 bg-white border-bottom">
        <div className="col">
          <Connect></Connect>
        </div>
      </div>

      <div className="row">
        <div className="col">
          <h5>Magnetic Encoder Alignment</h5>
          <p>To achieve the best result the magnetic disc must be mounted in the optimum distance to the sensor chip.</p>
          <img src={optimum} alt="Optimum distance to the sensor chip" />
        </div>
      </div>

      <div className="row">
        <div className="col">
          <hr></hr>
          <Footer></Footer>
        </div>
      </div>

    </div>
  );
}

export default App;
