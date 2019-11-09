import { interval, BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';
import { motionmaster } from '@synapticon/motion-master-proto';
import { decodeMotionMasterMessage, encodeMotionMasterMessage } from '@synapticon/motion-master-client';

import motionMasterClient from './motionMasterClient';

const MotionMasterMessage = motionmaster.MotionMasterMessage;

const pingSystemIntervalPeriod = 200;
const aliveTimeout = 1000;
const wsUrl = `ws://${window.location.hostname}:63524`; // motion-master-bridge

const pingSystemRequestMessage = MotionMasterMessage.create({
  id: null,
  request: {
    pingSystem: {},
  },
});

const pingSystemInterval$ = interval(pingSystemIntervalPeriod);
const pingSystemIntervalObserver = { next: () => motionMasterClient.sendMessage(pingSystemRequestMessage) };
let pingSystemIntervalSubscription = new Subscription();

const wssConfig = {
  binaryType: 'arraybuffer',
  closeObserver: {
    next: () => {
      pingSystemIntervalSubscription.unsubscribe();
    },
  },
  deserializer: (e) => new Uint8Array(e.data),
  openObserver: {
    next: () => {
      pingSystemIntervalSubscription = pingSystemInterval$.subscribe(pingSystemIntervalObserver);
    },
  },
  serializer: (value) => value,
  url: wsUrl,
};

export function wssBind() {

  let alive$ = new BehaviorSubject(false);
  let aliveTimeoutId;

  alive$.pipe(
    distinctUntilChanged(),
  ).subscribe(alive => {
    postMessage({ alive });
  });

  const wss$ = webSocket(wssConfig);

  const message$ = wss$.pipe(
    map(data => decodeMotionMasterMessage(data)),
  );

  message$.pipe(
    tap(() => {
      alive$.next(true);
      clearTimeout(aliveTimeoutId);
      aliveTimeoutId = setTimeout(() => { alive$.next(false) }, aliveTimeout);
    }),
    filter((msg) => !msg.status.systemPong),
  ).subscribe((msg) => { motionMasterClient.input$.next(msg) });

  motionMasterClient.output$.subscribe(msg => wss$.next(encodeMotionMasterMessage(msg)));

  alive$.pipe(
    distinctUntilChanged(),
  ).subscribe(alive => motionMasterClient.alive$.next(alive));

}
