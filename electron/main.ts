import {app, BrowserWindow, ipcMain, Menu, shell} from 'electron';
import * as path from 'path';
import * as fs from "fs";
import installExtension, {REACT_DEVELOPER_TOOLS} from "electron-devtools-installer";

const defaultTaskData = '{"category":[],"taskList":[]}';

const userDataPath = app.getPath('userData');

const isMac = process.platform === 'darwin'

const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
        label: app.name,
        submenu: [
            {role: 'about'},
            {type: 'separator'},
            {role: 'services'},
            {type: 'separator'},
            {role: 'hide'},
            {role: 'hideOthers'},
            {role: 'unhide'},
            {type: 'separator'},
            {role: 'quit'}
        ]
    }] : []),
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [
            {
                label: 'Open task data location',
                click: async () => {
                    await shell.showItemInFolder(path.join(userDataPath, './TaskData/taskData.json'));
                }
            },
            isMac ? {role: 'close'} : {role: 'quit'}
        ]
    },
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
            {role: 'reload'},
            {role: 'forceReload'},
            {role: 'toggleDevTools'},
            {type: 'separator'},
            {role: 'togglefullscreen'}
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Help documents',
                click: async () => {
                    await shell.openExternal('https://github.com/BenjaminYe36/Due-Helper/wiki');
                }
            },
            {
                label: 'Report Issues',
                click: async () => {
                    await shell.openExternal('https://github.com/BenjaminYe36/Due-Helper/issues');
                }
            }
        ]
    }
]

// @ts-ignore
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

function createWindow() {
    const win = new BrowserWindow({
        show: false,
        minWidth: 800,
        minHeight: 600,
        title: "Due Helper",
        icon: `${__dirname}/../icon.png`,
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
ipcMain.on('reading-json-synchronous', ((event) => {
    try {
        let dir = path.join(userDataPath, './TaskData/taskData.json');
        if (fs.existsSync(dir)) {
            console.log("file exists");
            event.returnValue = fs.readFileSync(dir, 'utf8');
        } else {
            console.log("file doesn't exist, use default value instead");
            event.returnValue = defaultTaskData;
        }
        console.log(path.join(userDataPath, './TaskData/taskData.json'));
    } catch (e) {
        console.log(e);
    }
}));

// ipc handles write to json when updates are done through ModelAPI
ipcMain.on('writing-json-synchronous', ((event, args) => {
    try {
        let dir = path.join(userDataPath, './TaskData');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            console.log("created dir");
        }
        fs.writeFileSync(path.join(userDataPath, './TaskData/taskData.json'), args);
        console.log("write success");
        console.log(path.join(userDataPath, './TaskData/taskData.json'));
        event.returnValue = 'write success';
    } catch (e) {
        console.log(e);
    }
}));