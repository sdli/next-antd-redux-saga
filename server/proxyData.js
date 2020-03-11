const App = require('./mock/appInfo');

module.exports = {

    /* 用户信息 */
    'GET /api/getAppInfo': App.appInfo
}