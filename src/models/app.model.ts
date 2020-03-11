import services from 'services/app.services';
import { modelWithRequest } from 'store';

// modelWithRequest，可以帮助你写入request组件
// 通过调用dispatch({type: 'app/commonRequest', payload: {service: 'app/getData', param:"", *callback(){}}})
// 来进行请求，当然，你也可以直接使用request
export default modelWithRequest(services, {
    namespace: 'app',

    state: {
        appInfo: {
            name: '',
            version: ''
        },
        date: ''
    },

    reducers: {
    },

    effects: {
    }
});
