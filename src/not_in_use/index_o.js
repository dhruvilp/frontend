//index_o.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Slack from './Slack';
import Events from './Events';
import './App.css';
import registerServiceWorker from './registerServiceWorker';
import {CookiesProvider} from 'react-cookie';

ReactDOM.render(<CookiesProvider><App /></CookiesProvider>, document.getElementById('register-root'));
ReactDOM.render(<Slack />, document.getElementById('announcements-list'));
ReactDOM.render(<Events />, document.getElementById('upcoming-list'));

// ReactDOM.render(<Col messageText="thisistext" />, document.getElementById('second-root'));
registerServiceWorker();
