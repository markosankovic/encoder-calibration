import { MotionMasterClient } from '@synapticon/motion-master-client';
import Long from 'long';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { first, map, mergeMap } from 'rxjs/operators';

class MotionMasterClientExtended extends MotionMasterClient {

  alive$ = new BehaviorSubject(false);

  getSystemVersion(observer) {
    this.requestGetSystemVersion().pipe(first()).subscribe(observer);
  }

  getDeviceInfo(observer) {
    this.requestGetDeviceInfo().pipe(first()).subscribe(observer);
  }

  getDeviceParameterValue(deviceAddress, parameter) {
    return this.requestGetDeviceParameterValues(deviceAddress, [parameter]).pipe(
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

  setDeviceParameterValue(deviceAddress, parameter) {
    return this.requestSetDeviceParameterValues(deviceAddress, [parameter]).pipe(first());
  }

  getBiSSRegisterValue(deviceAddress, registerAddress) {
    return of(1).pipe(
      mergeMap(() => this.setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 2, intValue: 0 })),
      mergeMap(() => this.setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 3, intValue: registerAddress })),
      mergeMap(() => this.setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 1, intValue: 0 })),
      mergeMap(() => this.setDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 1, intValue: 1 })),
      mergeMap(() => this.getDeviceParameterValue(deviceAddress, { index: 0x2800, subindex: 5 })),
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

}

const input$ = new Subject();
const output$ = new Subject();
const notification$ = new Subject();
const motionMasterClient = new MotionMasterClientExtended(input$, output$, notification$);

export default motionMasterClient;
