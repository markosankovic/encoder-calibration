const { encodeMotionMasterMessage, decodeMotionMasterMessage } = require('@synapticon/motion-master-client');
const { app, BrowserWindow, ipcMain } = require('electron');
const { BehaviorSubject, interval, Subject, Subscription } = require('rxjs');
const { first, timeout } = require('rxjs/operators');
const { v4 } = require('uuid');
const zmq = require('zeromq');

const fs = require('fs');
const path = require('path');
const isDev = require('electron-is-dev');

const endpointsPath = app.getPath('userData') + '/endpoints.json';
let prevEndpoints;

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

app.setName('Encoder Calibration');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      nodeIntegration: true
    },
    icon: 'assets/icons/512x512.png'
  });

  win.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);

  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    win.webContents.openDevTools();
  } else {
    // Hide MenuBar.
    win.setAutoHideMenuBar(true);
    win.setMenuBarVisibility(false);
  }

  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

//
// Connect to Motion Master.
//

const defaultConfig = {
  pingSystemIntervalPeriod: 150, // ping Motion Master at regular intervals
  motionMasterAliveTimeoutDue: 1000, // exit process when Motion Master doesn't send a heartbeat message in time specified
  serverEndpoint: 'tcp://127.0.0.1:62524', // request and receive status messages (response)
  notificationEndpoint: 'tcp://127.0.0.1:62525', // subscribe to a topic and receive published status messages (heartbeat and monitoring)
  identity: v4(), // ZeroMQ DEALER socket identity
};

const serverSocket = zmq.socket('dealer');
const notificationSocket = zmq.socket('sub');

serverSocket.identity = defaultConfig.identity;

const motionMasterMessageSubject = new Subject();
let motionMasterAliveSubscription;

const alive$ = new BehaviorSubject();

serverSocket.on('message', (data) => {
  const msg = decodeMotionMasterMessage(data);
  motionMasterMessageSubject.next(msg);

  if (!motionMasterAliveSubscription || motionMasterAliveSubscription.closed) {
    motionMasterAliveSubscription = motionMasterMessageSubject.pipe(
      timeout(defaultConfig.motionMasterAliveTimeoutDue),
    ).subscribe({
      error: () => alive$.next(false),
    });
    motionMasterMessageSubject.pipe(first(msg => msg !== undefined)).subscribe(() => alive$.next(true));
  }

  if (!msg.status.systemPong) {
    win.webContents.send('motion-master-message', msg);
  }
});

notificationSocket.on('message', (topic, data) => {
  const msg = decodeMotionMasterMessage(data);
  win.webContents.send('motion-master-notification', [topic.toString(), msg]);
});

subscribeToPingSystemInterval(defaultConfig.pingSystemIntervalPeriod);

ipcMain.on('motion-master-message', (_event, arg) => {
  const msg = encodeMotionMasterMessage(arg);
  serverSocket.send(Buffer.from(msg));
});

ipcMain.on('connect', (_event, arg) => connect(arg));
ipcMain.on('disconnect', (_event, arg) => disconnect(arg));

function connect(endpoints) {
  if (prevEndpoints) {
    disconnect(prevEndpoints);
  }

  serverSocket.connect(endpoints.serverEndpoint);
  notificationSocket.connect(endpoints.notificationEndpoint);

  prevEndpoints = endpoints;
  saveEndpoints(endpointsPath, endpoints);
}

function disconnect(endpoints) {
  try {
    serverSocket.disconnect(endpoints.serverEndpoint);
    notificationSocket.disconnect(endpoints.notificationEndpoint);
    prevEndpoints = null;
  } catch (err) {
    console.warn(`Already disconnected: ${err.message}`);
  }
}

function subscribeToPingSystemInterval(period) {
  const observable = interval(period);

  const pingSystemMsg = Buffer.from(encodeMotionMasterMessage({
    id: v4(),
    request: {
      pingSystem: {},
    },
  }));

  return observable.subscribe(() => serverSocket.send(pingSystemMsg));
}

// try to connect with default config endpoints on ready after win has initialized
app.on('ready', async () => {
  const endpoints = await loadEndpoints(endpointsPath, defaultConfig);
  connect(endpoints);

  let subscription = new Subscription();

  win.webContents.on('dom-ready', () => {
    subscription.unsubscribe();
    subscription = alive$.subscribe(alive => win.webContents.send('motion-master-alive', alive));
  });
});

function loadEndpoints(endpointsPath, defaultConfig) {
  return new Promise((resolve) => {
    let endpoints = { ...defaultConfig };
    fs.readFile(endpointsPath, (err, data) => {
      if (err) {
        console.warn(err.message);
      } else {
        try {
          const savedEndpoints = JSON.parse(data);
          endpoints = { ...savedEndpoints };
        } catch (err) {
          console.error(err);
        }
      }
      resolve(endpoints);
    });
  });
}

function saveEndpoints(endpointsPath, endpoints) {
  fs.writeFile(endpointsPath, JSON.stringify(endpoints), (err) => {
    if (err) {
      console.error(err);
    }
  });
}
