import { MotionMasterClient } from '@synapticon/motion-master-client';
import { ipcRenderer } from 'electron';
import Long from 'long';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { first, map, mergeMap } from 'rxjs/operators';

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
    map(deviceParameterValues => {
      if (deviceParameterValues) {
        if (deviceParameterValues.parameterValues && deviceParameterValues.parameterValues.length > 0) {
          return deviceParameterValues.parameterValues[0];
        }
      }
      return null;
    }),
  );
}

export function setDeviceParameterValue(deviceAddress, parameter) {
  return motionMasterClient.requestSetDeviceParameterValues(deviceAddress, [parameter]).pipe(first());
}

export function getBiSSRegisterValue(deviceAddress, registerAddress) {
  return of(1).pipe(
    mergeMap(() => setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 2, intValue: 0 })),
    mergeMap(() => setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 3, intValue: registerAddress })),
    mergeMap(() => setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 1, intValue: 0 })),
    mergeMap(() => setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 1, intValue: 1 })),
    mergeMap(() => getDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 5 })),
    map(parameter => {
      if (parameter && parameter.success) {
        const longValue = new Long(parameter.intValue.low, parameter.intValue.high, parameter.intValue.unsigned);
        return longValue.toInt();
      } else {
        console.error('Cannot read BiSS encoder register value', parameter);
        return 0;
      }
    })
  );
}

ipcRenderer.on('motion-master-alive', (_event, alive) => alive$.next(alive));
