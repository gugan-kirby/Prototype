import { connect } from './core/api.js';
import { route, startRouter } from './core/router.js';
import login from './screens/login.js';
import splash from './screens/splash.js';
import welcome from './screens/welcome.js';

route('/', splash);
route('/welcome', welcome);
route('/login', login);

await connect();
startRouter();
