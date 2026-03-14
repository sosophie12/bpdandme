const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Empêcher les instances multiples
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 420,
        height: 780,
        minWidth: 360,
        minHeight: 600,
        maxWidth: 600,
        resizable: true,
        title: 'Sophie',
        backgroundColor: '#f0e6f6',
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        show: false,
    });

    // Cacher la barre de menu
    Menu.setApplicationMenu(null);

    mainWindow.loadFile('index.html');

    // Afficher quand prêt pour éviter le flash blanc
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Gérer la deuxième instance — ramener la fenêtre existante
app.on('second-instance', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
