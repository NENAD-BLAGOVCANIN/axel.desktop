const { app, BrowserWindow, ipcMain, ipcRenderer, BrowserView, Tray, Menu, Notification, session } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
log.transports.file.resolvePathFn = () => path.join('C:/Users/User/Desktop/multichat', '/logs/main.log');

log.log("App version is " + app.getVersion());

let mainWindow;
let tray;
const appPath = path.resolve(app.getPath('exe'));
const isDev = true;
let isSingleInstance = app.requestSingleInstanceLock()
if (!isSingleInstance) {
    app.quit()
}

const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

if (!isDev) {
    app.setLoginItemSettings({
        openAtLogin: true,
        path: appPath
    });
}

if (process.platform === 'win32') {
    app.setAppUserModelId(app.name)
}

function createTray() {
    tray = new Tray(path.join(__dirname, '../src/assets/img/icon.png'));

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Multichat', click: () => mainWindow.show() },
        { label: 'Exit Program', click: () => app.quit() }
    ]);

    tray.setToolTip('Multichat');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => mainWindow.show());
}

app.on('ready', () => {

    createTray();

    mainWindow = new BrowserWindow({
        width: 500,
        height: 400,
        autoHideMenuBar: true,
        frame: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            enableRemoteModule: true,
            sandbox: false,
            preload: path.join(__dirname, 'preload.js'),
            webviewTag: true
        },
        icon: path.join(__dirname, '../src/assets/img/icon.png'),
    });

    mainWindow.loadURL(startURL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    autoUpdater.checkForUpdatesAndNotify();

});

ipcMain.on('close-main-window', (event) => {
    if (!app.isQuitting) {
        event.preventDefault();
        mainWindow.hide();
    }
});

app.on('before-quit', () => {
    app.isQuitting = true;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('check-for-updates', async (event) => {

    log.info("Checking for updates!");

    try {
        const updateInfo = await autoUpdater.checkForUpdatesAndNotify();
        if (updateInfo) {
            event.sender.send('update-available'); // Send message back to renderer
        }
    } catch (error) {
        console.error('Error checking for updates:', error);
    }
});


autoUpdater.on('update-available', (info) => {
    log.info('Update available.');
});

autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available.');
});

autoUpdater.on('download-progress', (info) => {
    log.info(info);
});

autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded; will install now');
    autoUpdater.quitAndInstall();
});

app.on('second-instance', (event, argv, cwd) => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
    }
})

ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('close-window', () => {
    mainWindow.close();
});

ipcMain.on('execute-command', (event, command) => {
    const fullCommand = `axel command "${command}"`;
    
    exec(fullCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            event.reply('command-execution-result', { success: false, error: error.message });
            return;
        }
        if (stderr) {
            console.error(`Command stderr: ${stderr}`);
            event.reply('command-execution-result', { success: false, error: stderr });
            return;
        }

        console.log(`Command stdout: ${stdout}`);
        event.reply('command-execution-result', { success: true, output: stdout });
    });
});