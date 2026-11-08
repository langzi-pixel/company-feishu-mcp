import {configFromEnv} from './config.js';
import {createStore} from './store.js';
import {createApp} from './app.js';
const config=configFromEnv();
const server=createApp(config,createStore()).listen(config.port,'0.0.0.0',()=>console.log(JSON.stringify({event:'ready',port:config.port,basePath:config.basePath})));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
