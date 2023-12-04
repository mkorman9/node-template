import {createApp, appendErrorHandlers} from './http/app_template';

const app = createApp();



export default appendErrorHandlers(app);
