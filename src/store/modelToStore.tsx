// 全局immutable组件
import { combineReducers, createStore, applyMiddleware } from 'redux';

// 构建工具
import { composeWithDevTools } from 'redux-devtools-extension';

// saga工具
import createSagaMiddleware from 'redux-saga';
import {
  put, select, all, takeEvery
} from 'redux-saga/effects';
import getSagaEffects from './getSagaEffects';

// model数据结构
export interface ModelContentType {
  namespace: string | number;
  state?: Record<string, any> | Map<string, any>;
  initialState?: Record<string, any> | Map<string, any>;
  effects?: undefined | null | Record<string, Function>;
  reducers?: undefined | null | Record<string, Function>;
  subscriptions?: Record<string, Function> | Record<string, any>[];
}

// option配置项
export interface StoreOptions {
  persist?: undefined | Persist;
  initialState?: any;
  req?: any;
  isServer?: boolean;
}

export interface Persist {
  env: 'browser' | 'node';
  keys: string[];
}

// action定义
export interface Action {
  type: string;
  payload: Record<string, any>;
  action?: any;
}

// 初始化

/**
 * model提取reducers
 * @param {Object} model
 */
function modelReducersToStore(model: any) {

  // 如果存在多个model则合并
  if (Object.prototype.toString.call(model) === '[object Array]') {
    let tempModels = {};

    (model as any).forEach((val: any) => {
      tempModels = Object.assign(
        tempModels,
        modelReducersToStore(val)
      );
    });

    return tempModels;
  }

  model.initialState = model.state;

  return {
    // 将model的命名空间插入合并为同一个reducer
    [model.namespace]: (state = model.state, action: Action) => {

      const [namespace, actionType] = action.type.split('/');

      // 是否需要清空全部store
      if (namespace === 'clear') {
        switch (actionType) {
          case 'all':
            return model.initialState;
          default:
            return state;
        }
      }

      // 检查是否为用一个命名空间，否则直接返回state
      if (namespace === model.namespace) {
        if (model.reducers && actionType in model.reducers) {
          const newState = model.reducers[actionType](state, action);

          return newState;
        }
        return state;
      }
      return state;
    }
  };
}

// 获取初始状态
function getInitialState(models: Record<string, any>[]) {
  let initialState = {};
  models.forEach((v) => {
    initialState[v.namespace] = { ...v.state };
  });

  return initialState;
}

/**
 * 生成generator方法
 */
function pushGeneratorArray(model: ModelContentType, dispatch: Function, effects: any) {
  const efs = model.effects;
  const sub = model.subscriptions;
  const { namespace } = model;

  if (typeof efs !== 'undefined') {
    const effectList = Object.entries(efs || {});

    effectList.forEach((effect: [string, Function]) => {

      const effectName = `${namespace}/${effect[0]}`;

      effects.push(takeEvery(effectName, function* (action) {
        const routing = yield select(state => state.routing);
        yield effect[1](action, { ...getSagaEffects(model), query: routing });
      }));
    });
  }

  if (typeof sub !== 'undefined') {

    if (Object.prototype.toString.call(sub) === '[object Array]') {
      sub.forEach((listener: any) => {

        if (listener.on) {
          if (window) {
            (window as any)[listener.on] = (e: EventTarget) => {
              dispatch({ type: `on/${listener.on}`, action: e });
            };
          }

          effects.push(takeEvery(`on/${listener.on}`, function* (action) {
            yield put({ type: listener.dispatch, action });
          })
          );
        }
      });
    }
  }
}

/**
 * 启用saga的takeEvery
 * @param {Object / Array} model 来自models文件夹的数据模型
 */
function startEffects(model: ModelContentType, dispatch: Function) {
  let tempEffects = [];
  if (Object.prototype.toString.call(model) === '[object Array]') {
    (model as any).forEach((m: ModelContentType) => pushGeneratorArray(m, dispatch, tempEffects));
  } else {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    pushGeneratorArray(model, dispatch, tempEffects);
  }

  return tempEffects;
}

/**
 * 获取store，包含：
 * [sagamiddleware]：用于执行generator
 * [reducers]：函数合并，用于合并不同model中的reducer
 * [redux(composeWithDevTools)]：用于浏览器开启redux支持
 * @param {Array | Object} model 用户的model文件
 */
function createApp({ initialState, req, isServer }: StoreOptions, models: ModelContentType[]) {

  const SagaMiddleware = createSagaMiddleware();
  const middlewares = [SagaMiddleware];

  const __reducers = modelReducersToStore(
    models
  ) as any;

  const store: any = createStore(
    // 从model中，提取reducers
    // 此处判断是否为immutable，如果是，则使用ImmutableCombineReducers
    combineReducers(__reducers),

    // 初始化数据
    initialState || {},

    /**
     * 注意：如果你需要react-devtools而不是redux-devtools：
     * 1. 请到nw-build中的package.json修改chromium-args，
     * 2. 或者指定启动方式npm run start-nw命令中的-load-extension;
     */
    process.env.NODE_ENV !== 'production'
      ? composeWithDevTools(applyMiddleware(...middlewares))
      : applyMiddleware(...middlewares)
  );

  // 调用sagaMiddleWare的runsaga模块
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const modelEffects = startEffects(models as any, store.dispatch);
  // eslint-disable-next-line @typescript-eslint/no-use-before-define

  const rootSaga = function* () {
    yield all(
      modelEffects,
    );
  };

  /**
   * 将store和provider渲染至dom
   */
  if (req || !isServer) {
    store.sagaTask = store.sagaTask ? store.sagaTask : SagaMiddleware.run(rootSaga);
  }

  return store;
}
export { getInitialState };
export default createApp;
