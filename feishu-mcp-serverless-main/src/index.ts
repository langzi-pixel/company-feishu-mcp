import {configFromEnv} from './config.js';
import {createStore} from './store.js';
import {createApp} from './app.js';
const config=configFromEnv();
const store=createStore();
const server=createApp(config,store).listen(config.port,'0.0.0.0',()=>console.log(JSON.stringify({event:'ready',port:config.port,basePath:config.basePath})));
const shutdown=()=>server.close(()=>{store.close?.();process.exit(0);});
process.on('SIGTERM',shutdown);
process.on('SIGINT',shutdown);
