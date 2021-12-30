import {app, BrowserWindow, ipcMain} from 'electron';
import * as path from 'path';
import * as fs from "fs";
import installExtension, {REACT_DEVELOPER_TOOLS} from "electron-devtools-installer";

const defaultTaskData = '{"category":[],"taskList":[]}';

function createWindow() {
    const win = new BrowserWindow({
        show: false,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    if (app.isPackaged) {
        // 'build/index.html'
        win.loadURL(`file://${__dirname}/../index.html`);
    } else {
        win.loadURL('http://localhost:3000/index.html');

        // win.webContents.openDevTools();

        // Hot Reloading on 'node_modules/.bin/electronPath'
        require('electron-reload')(__dirname, {
            electron: path.join(__dirname,
                '..',
                '..',
                'node_modules',
                '.bin',
                'electron' + (process.platform === "win32" ? ".cmd" : "")),
            forceHardReset: true,
            hardResetMethod: 'exit'
        });
    }
    // maximize window
    win.maximize();
    win.show();


}

app.whenReady().then(() => {
    // DevTools
    installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
});


// ipc handles reading json from existing local data (if there is one already)
ipcMain.on('reading-json-synchronous', ((event, args) => {
    try {
        let dir = path.join(__dirname, '../TaskData/taskData.json');
        if (fs.existsSync(dir)) {
            console.log("file exists");
            event.returnValue = fs.readFileSync(dir, 'utf8');
        } else {
            console.log("file doesn't exist, use default value instead");
            event.returnValue = defaultTaskData;
        }
    } catch (e) {
        console.log(e);
    }
}));

// ipc handles write to json when updates are done through ModelAPI
ipcMain.on('writing-json-synchronous', ((event, args) => {
    try {
        let dir = path.join(__dirname, '../TaskData');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            console.log("created dir");
        }
        fs.writeFileSync(path.join(__dirname, '../TaskData/taskData.json'), args);
        console.log("write success");
        console.log(path.join(__dirname, '../TaskData/taskData.json'));
        event.returnValue = 'write success';
    } catch (e) {
        console.log(e);
    }
}));