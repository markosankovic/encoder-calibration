import { MotionMasterClient } from '@synapticon/motion-master-client';
import { ipcRenderer } from 'electron';
import Long from 'long';
import { BehaviorSubject, concat, Subject } from 'rxjs';
import { first, last, map } from 'rxjs/operators';

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

export function getBiSSRegisterValue(deviceAddress, registerAddress) {
  return concat(
    setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 2, intValue: 0 }),
    setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 3, uintValue: registerAddress }),
    setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 1, intValue: 0 }),
    setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 1, intValue: 1 }),
    getDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 5 }),
  ).pipe(
    last(),
    map(parameter => {
      if (parameter.intValue) {
        const longValue = new Long(parameter.intValue.low, parameter.intValue.high, parameter.intValue.unsigned);
        return longValue.toInt();
      } else {
        console.error(`Error reading 0x2008:5. There is no intValue on this parameter.`, parameter.error);
        return 0;
      }
    })
  );
}

export function calcAcGain(val) {
  const table = [4.4, 7.8, 12.4, 20.7];
  return table[val];
}

export function calcAfGain(val) {
  if (val === 0x0) {
    return 1;
  } else if (val === 0x1) {
    return 1.45;
  } else if (val === 0x7) {
    return 13.75;
  } else {
    return Math.exp(Math.log(20) / 8 * val);
  }
}

ipcRenderer.on('motion-master-alive', (_event, alive) => alive$.next(alive));
