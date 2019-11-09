import { ipcRenderer } from 'electron';

import motionMasterClient from './motionMasterClient';

export function zmqBind() {
  ipcRenderer.on('motion-master-message', (_event, message) => motionMasterClient.input$.next(message));
  ipcRenderer.on('motion-master-notification', (_event, notification) => motionMasterClient.notification$.next(notification));
  ipcRenderer.on('motion-master-alive', (_event, alive) => motionMasterClient.alive$.next(alive));

  motionMasterClient.input$.subscribe((msg) => {
    console.log('i:', msg);
  });

  motionMasterClient.output$.subscribe((msg) => {
    console.log('o:', msg);
    ipcRenderer.send('motion-master-message', msg);
  });
}

export function zmqConnect(config) {
  ipcRenderer.send('connect', config);
  return false;
}

export function zmqDisconnect(config) {
  ipcRenderer.send('disconnect', config);
}
