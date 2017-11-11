# Simple Electron Chat App

This is just a demo of a basic chat app using Electron and React.
The server is included and must be run using Node.js

## Tiny features

* You provide a username to enter a chat room. Server endpoint is configurable.
* Supports Markdown.
* List of connected users.
* Informs connection and disconnection events.
* Informs when someone is typing.
* Supports multiple instances
* Message notification.

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/demian85/electron-chat-app-demo.git
# Go into the repository
cd electron-chat-app-demo
# Install dependencies
npm install
# Run local server
npm run server
# Run the app
npm start
```

If you want to test the app using multiple instances, remember you should only have one instance of the chat server running!

## Create cross platform packages
```bash
# Build packages for Linux
npm run pack:linux
# Build packages for macOS
npm run pack:macos
# Build packages for Windows
npm run pack:win
```
You will now have a folder for your platform and you can run the app by executing `electron-chat-app-demo`

Learn more about Electron and its API in the [documentation](http://electron.atom.io/docs/latest).

## Create distribution packages

- [ ] Windows `.exe` executable file
- [x] macOS `.dmg` or `.app` file