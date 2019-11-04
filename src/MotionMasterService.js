import { MotionMasterClient } from '@synapticon/motion-master-client';
import { ipcRenderer } from 'electron';
import { BehaviorSubject, Subject } from 'rxjs';
import { first } from 'rxjs/operators';

const input$ = new Subject();
const output$ = new Subject();
const notification$ = new Subject();
export const motionMasterClient = new MotionMasterClient(input$, output$, notification$);

export const alive$ = new BehaviorSubject();

ipcRenderer.on('motion-master-message', (_event, message) => input$.next(message));
ipcRenderer.on('motion-master-notification', (_event, notification) => notification.next(notification));

input$.subscribe((msg) => {
  console.log('i:', msg);
});

output$.subscribe((msg) => {
  console.log('o:', msg);
  ipcRenderer.send('motion-master-message', msg);
});

export function connect(config) {
  ipcRenderer.send('connect', config);
  return false;
}

export function disconnect(config) {
  ipcRenderer.send('disconnect', config);
}

export function getSystemVersion(observer) {
  motionMasterClient.requestGetSystemVersion().pipe(first()).subscribe(observer);
}

export function getDeviceInfo(observer) {
  motionMasterClient.requestGetDeviceInfo().pipe(first()).subscribe(observer);
}

export function getManufacturerSoftwareVersionDeviceParameter(deviceAddress, observer) {
  const parameters = [{ index: 0x100A, subindex: 0 }];
  motionMasterClient.requestGetDeviceParameterValues(deviceAddress, parameters).pipe(first()).subscribe(observer);
}

ipcRenderer.on('motion-master-alive', (_event, alive) => alive$.next(alive));
