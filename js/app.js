import { connect } from './core/api.js';
import { route, startRouter } from './core/router.js';
import splash from './screens/splash.js';

route('/', splash);

await connect();
startRouter();
