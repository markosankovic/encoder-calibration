import React from 'react';
import { alive$, connect, disconnect, motionMasterClient } from './MotionMasterService';

console.log(motionMasterClient);

class Connect extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      alive: false,
      serverEndpoint: 'tcp://127.0.0.1:62524',
      notificationEndpoint: 'tcp://127.0.0.1:62525',
    };

    this.handleServerEndpointChange = this.handleServerEndpointChange.bind(this);
    this.handleNotificationEndpointChange = this.handleNotificationEndpointChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
  }

  componentDidMount() {
    alive$.subscribe(alive => {
      this.setState({ alive });
    });
  }

  handleServerEndpointChange(event) {
    this.setState({ serverEndpoint: event.target.value });
  }

  handleNotificationEndpointChange(event) {
    this.setState({ notificationEndpoint: event.target.value });
  }

  handleSubmit(event) {
    connect(this.state);
    event.preventDefault();
  }

  handleDisconnect() {
    disconnect(this.state);
  }

  render() {

    const aliveBadge = this.state.alive
      ? <span class="badge badge-success p-2">Motion Master is online</span>
      : <span class="badge badge-danger p-2">Motion Master is not responding</span>

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="form-row align-items-center">
          <div className="col-auto">
            <label className="sr-only">Server Endpoint</label>
            <input type="text" className="form-control" placeholder="Server Endpoint" title="Server Endpoint"
              value={this.state.serverEndpoint} onChange={this.handleServerEndpointChange} />
          </div>
          <div className="col-auto">
            <label className="sr-only">Notification Endpoint</label>
            <input type="text" className="form-control" placeholder="Notification Endpoint" title="Notification Endpoint"
              value={this.state.notificationEndpoint} onChange={this.handleNotificationEndpointChange} />
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-success">CONNECT</button>
          </div>
          <div className="col-auto">
            <button type="button" className="btn btn-outline-primary" onClick={this.handleDisconnect}>DISCONNECT</button>
          </div>
          <div className="col-auto ml-auto">
            {aliveBadge}
          </div>
        </div>
      </form>
    );
  }
}

export default Connect;
