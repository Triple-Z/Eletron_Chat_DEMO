/* eslint-env browser, node */
/* global React */
const notifier = require('node-notifier');
const marked = require('marked');
const mainWindow = require('electron').remote.getGlobal('mainWindow');

let typing = false;
let typingTimer;

var currentUser;

document.addEventListener('DOMContentLoaded', function onLoad() {
  const app = React.createElement(App);
  ReactDOM.render(app, document.body);
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      url: '',
      users: [],
      messages: [],
      status: ''
    };
    this.onLogin = this.onLogin.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onSend = this.onSend.bind(this);
  }
  initSocket(url) {
    this.setState({ status: 'Connecting...' });
    const socket = io.connect(url);
    socket.on('connect', () => {
      this.appendMessage(`Connected to server ${this.state.url}`);
      this.setState({ status: '' });
    });
    socket.on('message', data => {
      this.appendMessage(`__${data.username}:__ ${data.text}`);
      if (data.username != currentUser) {
        notifier.notify({
          'title': 'Electron Chat DEMO (' + currentUser + ')',
          'message': `${data.username}: ${data.text}`,
          wait: true
        }, function (err, noData) {
          console.log('waited');
        }).on('click', function () {
          console.log('Clicked');
          mainWindow.show();
          mainWindow.focus();
        });
      }
    });
    socket.on('login', data => {
      this.appendMessage(`${data.username} has logged in.`);
      this.setState({ users: data.users });
      if (data.username != currentUser) {
        notifier.notify({
          'title': 'Electron Chat DEMO (' + currentUser + ')',
          'message': `${data.username} has logged in.`,
          wait: true
        }, function (err, noData) {
          console.log('Waited');
          console.log(err, noData);
        }).on('click', function () {
          console.log('Clicked');
        });
      }
    });
    socket.on('typing', data => {
      this.setState({ status: `${data.username} is typing...` });
    });
    socket.on('stop-typing', () => {
      this.setState({ status: '' });
    });
    socket.on('logout', data => {
      this.appendMessage(`${data.username} disconnected.`);
      this.setState({ users: data.users });
      if (data.username != currentUser) {
        notifier.notify({
          'title': 'Electron Chat DEMO (' + currentUser + ')',
          'message': `${data.username} disconnected.`
        }).on('click', function () {
          mainWindow.show();
          mainWindow.focus();
        });
      }
    });
    this.socket = socket;
  }
  appendMessage(message) {
    this.setState((prev, props) => {
      const messages = prev.messages;
      messages.push(message);
      return { messages };
    });
  }
  onLogin(url, username) {
    this.setState({ url, username });
    this.initSocket(url);
    this.socket.emit('login', { username });
    this.refs.inputBar.focus();
  }
  onInput(text) {
    const username = this.state.username;
    if (!typing) {
      typing = true;
      this.socket.emit('typing', { username });
    }
    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
    typingTimer = setTimeout(() => {
      typing = false;
      this.socket.emit('stop-typing', { username });
    }, 1000);
  }
  onSend(text) {
    const username = this.state.username;
    this.socket.emit('message', { username, text });
  }
  componentDidMount() {
    this.refs.loginBox.focus();
  }
  render() {
    return React.createElement(
      'main',
      null,
      React.createElement(LoginBox, { ref: 'loginBox', url: 'http://chat.triplez.cn:3010', onLogin: this.onLogin }),
      React.createElement(
        'div',
        { className: 'content' },
        React.createElement(UserList, { users: this.state.users }),
        React.createElement(ChatArea, { messages: this.state.messages, status: this.state.status })
      ),
      React.createElement(InputBar, { ref: 'inputBar', onInput: this.onInput, onSend: this.onSend })
    );
  }
}

class LoginBox extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
  }
  focus() {
    this.refs.username.focus();
  }
  onKeyDown(e) {
    if (e.keyCode === 13) {
      const value = this.refs.username.value.trim();
      const url = this.refs.url.value.trim();
      if (value) {
        this.props.onLogin(url, value);
        this.refs.root.classList.add('hidden');
      }
      currentUser = value;
      document.title = 'Electron Chat DEMO (' + value + ')';
    }
  }
  render() {
    return React.createElement(
      'div',
      { id: 'login-box', ref: 'root' },
      React.createElement(
        'div',
        null,
        React.createElement(
          'h2',
          null,
          'Login'
        ),
        React.createElement('input', { type: 'url', id: 'server-url', ref: 'url', value: this.props.url }),
        React.createElement('input', { type: 'text', placeholder: 'enter username', id: 'username', ref: 'username', onKeyDown: this.onKeyDown, autofocus: true })
      )
    );
  }
}

class UserList extends React.Component {
  render() {
    const opts = { sanitize: true };
    const users = this.props.users.map(user => React.createElement('li', { dangerouslySetInnerHTML: { __html: marked(user, opts) } }));
    return React.createElement(
      'aside',
      null,
      React.createElement(
        'h3',
        null,
        'Connected Users'
      ),
      React.createElement(
        'ul',
        { id: 'users' },
        users
      ),
      React.createElement(
        'div',
        { id: 'user-stats' },
        users.length,
        ' users online.'
      )
    );
  }
}

class ChatArea extends React.Component {
  render() {
    const opts = { sanitize: true };
    const text = this.props.messages.map(msg => `${marked(msg, opts)}\n`).join('');
    return React.createElement(
      'div',
      { id: 'chat' },
      React.createElement('div', { id: 'chat-text', dangerouslySetInnerHTML: { __html: text } }),
      React.createElement(
        'div',
        { id: 'chat-status-msg' },
        this.props.status
      )
    );
  }
}

class InputBar extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  onKeyDown(e) {
    if (e.keyCode === 13) {
      this.send();
    }
  }
  onInput() {
    const value = this.refs.input.value.trim();
    this.props.onInput(value);
  }
  onClick() {
    this.send();
  }
  send() {
    const value = this.refs.input.value.trim();
    if (value) {
      this.props.onSend(value);
      this.refs.input.value = ''; // Should I mutate state instead?
    }
  }
  focus() {
    this.refs.input.focus();
  }
  render() {
    return React.createElement(
      'div',
      { className: 'input' },
      React.createElement('input', {
        type: 'text',
        id: 'text-input',
        ref: 'input',
        placeholder: 'say something...',
        onInput: this.onInput,
        onKeyDown: this.onKeyDown
      }),
      React.createElement(
        'a',
        { id: 'send-btn', className: 'waves-effect waves-light btn', onClick: this.onClick },
        'Send'
      )
    );
  }
}