import { connect } from './core/api.js';
import { route, setChrome, startRouter } from './core/router.js';
import { renderTabs, startShell } from './screens/shell.js';
import enquiryDetails from './screens/enquiry-details.js';
import home from './screens/home.js';
import notifications from './screens/notifications.js';
import login from './screens/login.js';
import register from './screens/register.js';
import splash from './screens/splash.js';
import welcome from './screens/welcome.js';

route('/', splash);
route('/welcome', welcome);
route('/login', login);
route('/register', register);
route('/home', home);
route('/notifications', notifications);
route('/enquiry/new', enquiryDetails);

setChrome(renderTabs);

await connect();
startShell();
startRouter();
