import {
  MotionMasterClientWebSocketConnection,
  MotionMasterNotificationWebSocketConnection,
} from '@synapticon/motion-master-client';
import Long from 'long';
import { of } from 'rxjs';
import { first, map, mergeMap } from 'rxjs/operators';

export const motionMasterClientWebSocketConnection = new MotionMasterClientWebSocketConnection();
export const motionMasterClient = motionMasterClientWebSocketConnection.client;
export const alive$ = motionMasterClientWebSocketConnection.alive$;

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

motionMasterClientWebSocketConnection.open();

export const motionMasterNotificationWebSocketConnection = new MotionMasterNotificationWebSocketConnection();
motionMasterNotificationWebSocketConnection.subscribe('notification', 1);
export const motionMasterNotifcation = motionMasterNotificationWebSocketConnection.notification;
export const systemEvent$ = motionMasterNotifcation.systemEvent$;
