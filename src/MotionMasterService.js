import { MotionMasterClient } from '@synapticon/motion-master-client';
import { ipcRenderer } from 'electron';
import { BehaviorSubject, Subject } from 'rxjs';
import { first, map } from 'rxjs/operators';

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

export function getDeviceParameterValue(deviceAddress, parameter) {
  return motionMasterClient.requestGetDeviceParameterValues(deviceAddress, [parameter]).pipe(
    first(),
    map(deviceParameterValues => deviceParameterValues ? deviceParameterValues.parameterValues[0] : null),
  );
}

export function setDeviceParameterValue(deviceAddress, parameter) {
  return motionMasterClient.requestSetDeviceParameterValues(deviceAddress, [parameter]).pipe(first());
}

export async function getBiSSRegisterValue(deviceAddress, registerAddress) {
  await setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 2, intValue: 0 }).toPromise();
  await setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 3, uintValue: registerAddress }).toPromise();
  await setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 1, intValue: 0 }).toPromise();
  await setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 1, intValue: 1 }).toPromise();
  return getDeviceParameterValue(deviceAddress, { index: 0x2008, subindex: 5 });
}

ipcRenderer.on('motion-master-alive', (_event, alive) => alive$.next(alive));
