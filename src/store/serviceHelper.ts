import request from './request';

interface ConfigType {
    apiPrefix: string;
    CORS: string[];
    YQL: string[];
    api: {
        [key: string]: string;
    };
}

interface ApiItemType {
    namespace: string;
    apis: {
        [key: string]: string;
    };
}

// ps:
// 若使用了动态路径参数, 例如'get/:id/cars',
//   可以使用config.dynamicSegment, 系统会自动获取对应值进行填充
//   config还内置了其他可配置的键, 见ConfigType
//
// 1. GET: data默认是queryString(data[, config])
// 2. POST, PUT等: data默认是reqBody(data[, config]);
const createService = (apis: any) => {
    const apiReducer = [apis].reduce((acc: object, item: ApiItemType) => {
        const current: {
            [key: string]: string;
        } = {};
        for (const key of Object.keys(item.apis)) {
            const value = item.apis[key];
            const scopedKey = `${item.namespace}/${key}`;
            current[scopedKey] = value;
        }

        return {
            ...acc,
            ...current,
        };
    }, {});


    const api = apiReducer;
    const apiPrefix = '';

    type ConfigType = Partial<{
        // 非GET时仍需使用queryString在此传入
        params: { [key: string]: string | number | boolean };
        // 动态路径参数, 仿路由设计
        dynamicSegment: { [key: string]: string | number };
        noGlobalError: boolean;
        contentType: string;
        fetchType: string;
    }>

    type ArgsType = [any] | [any, ConfigType];

    const gen = (params: string) => {
        let url = apiPrefix + params;
        let method = 'get'; let fetchType = null;

        const paramsArray = params.split(' ');
        if (paramsArray.length === 2) {
            [method] = [...paramsArray];
            url = apiPrefix + paramsArray[1];
        }

        if (paramsArray[2]) {
            fetchType = paramsArray[2] as any;
            url = apiPrefix + paramsArray[1];
        }

        return function (...rest: ArgsType) {
            const [data, config] = [...rest];

            return request({
                url,
                data,
                method,
                ...config,
                fetchType,
            });
        };
    };

    const APIHelper: { [key: string]: (...rest: ArgsType) => any } = {};

    for (const key in api) {
        APIHelper[key] = gen(api[key]);
    }

    return APIHelper;
};

export default createService;
