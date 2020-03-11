import { serviceHelper } from "store/index";

const appConfig = {
  namespace: 'app',

  apis: {
    getAppInfo: 'GET /api/getAppInfo',
  },
};

export default serviceHelper(appConfig);
