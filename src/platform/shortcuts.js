const { Menu, MenuItem } = require('electron')
const menu = new Menu()

const configShortcuts = webContents => {
    const template = [
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'pasteandmatchstyle' },
                { role: 'delete' },
                { role: 'selectall' },
                { 
                    label: 'Save',
                    accelerator: 'Cmd+S',
                    click () {
                        webContents.send('accelerator', 'save')
                    }
                }
            ]
        },
        {
            label: 'Document',
            submenu: [
                {
                    label: 'Save',
                    accelerator: 'Cmd+S',
                    click () {
                        webContents.send('accelerator', 'save')
                    }
                },
                {
                    label: 'New',
                    accelerator: 'Cmd+N',
                    click () {
                        webContents.send('accelerator', 'new')
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            role: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click () { require('electron').shell.openExternal('https://electronjs.org') }
                }
            ]
        }
    ]

    template.unshift({
        label: 'Yamer',
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services', submenu: [] },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    })

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

export { configShortcuts }

