import { connect } from './core/api.js';
import { route, startRouter } from './core/router.js';

await connect();
startRouter();
