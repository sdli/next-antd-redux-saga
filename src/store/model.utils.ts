import { Toast } from 'antd-mobile';

/**
 * 此方法用于生成一个model框
 * 用来添加以下状态到model中
 * 1. loading： 加载状态
 *
 * 添加以下reducer到model中
 * 1. save
 * 2. loadingController
 *
 * 添加以下effects到model中
 * 1. commonRequest
 */
export default (services: any, baseModal: Record<string, any>) => {
  const {
    subscriptions = {}, state = {}, namespace = '', effects = {}, reducers = {}
  } = baseModal;
  const moreState = {
    loading: {}
  };

  const moreReducers = {
    save: (state, action) => {
      return { ...state, ...action.payload };
    },

    // loading控制器
    loadingController({ loading: oldLoading, ...rest }, { payload }) {
      const { service, serviceGroup, type } = payload;
      const loading = { ...oldLoading };

      if (service) {
        if (type === 'delete') {
          loading[service] = false;
        } else {
          loading[service] = true;
        }
      }

      if (serviceGroup) {
        serviceGroup.forEach((v: any) => {
          if (type === 'delete') {
            loading[service] = false;
          } else {
            loading[service] = true;
          }
        });
      }

      return {
        ...rest,
        loading,
      };
    },
  };

  const moreEffects = {

    * request({ payload }, {
      all, call
    }) {
      const { requests, callback } = payload;

      const params = requests.map((v: any) => {
        return v.param ? v.param : null;
      });

      // 发起请求
      const data = yield all(
        requests.map((v: any, i: number) => call(
          v.request,

          // inCharge以接口param为主，如果没有inCharge则只显示当前inCharge,
          // 注意部分接口需要loginuser
          // Object.assign({inCharge: userInfos.EngName}, v.param ? v.param : {}))));
          params[i]
        )));

      // 回调调用
      yield callback(data, params);
    },

    * commonRequest({ payload }, { put }) {

      console.log('common request');
      
      const {
        service, save, extraSave, param, serviceGroup, successMessage, next, callback
      } = payload;

      // 开始前准备
      if (service) {

        if (!services[service]) {
          console.error(`不存在的service,请检查：${service}`);
          return;
        }

        yield put({
          type: 'loadingController',
          payload: {
            service,
            type: 'add'
          }
        });
      }

      if (serviceGroup) {
        if (serviceGroup.some((v: any) => !services[v.service])) {
          console.error(`不存在的service,请检查：${serviceGroup.find((v: any) => !services[v.service]).service}`);
          return;
        }

        yield put({
          type: 'loadingController',
          payload: {
            serviceGroup,
            type: 'add'
          }
        });
      }

      // 开始
      yield put({
        type: 'request',
        payload: {
          requests:
            service ? [{
              request: services[service],
              param: param
            }] : serviceGroup.map((v: any) => ({
              request: services[v.service],
              param: v.param
            })),
          * callback(data, params: any) {

            // 检测是否有errorMessage
            if (data && data.length > 0 && !data.some((v: any) => v.errorMessage)) {

              // 如果有save，则合并extra和save
              if (save) {
                const extra = extraSave || {};
                yield put({
                  type: 'save',
                  payload: data[0] && 'data' in data[0] && data[0].data ? {
                    [save]: data[0] && 'data' in data[0] ? data[0].data : data[0],
                    ...extra
                  } : {
                      ...extra
                    }
                });
              }

              // 如果只有extraSave没有save
              if (!save && extraSave) {
                yield put({
                  type: 'save',
                  payload: {
                    ...extraSave
                  }
                });
              }

              if (serviceGroup) {

                yield put({
                  type: 'save',
                  payload: Object.assign.apply(null, serviceGroup.map((v: any, i: number) => {

                    return v.save && data[i].data ? ({
                      [v.save]: data[i].data,
                      ...(v.extraSave || {})
                    }) : { ...(v.extraSave || {}) };
                  }))
                });
              }

              // 如果有进一步请求，则进行新的请求
              if (next && next.service) {
                yield put({
                  type: 'commonRequest',
                  payload: next
                });
              }

              // 如果next中为action，则请求action
              if (next && next.action) {
                yield put({
                  type: next.action,
                  payload: next.payload
                });
              }

              // 如果成功，则提示弹框
              if (successMessage && data && data[0] && data[0].code == 200) {
                Toast.success(successMessage);
              }
            }

            // 回调
            if (callback && data && data[0] && (data[0].code == 200 || data[0].code == 0)) {
              if (data.length === 1 && data[0].data) {
                yield callback(data[0].data);
              } else {
                yield callback(data.map((v: any) => v.data), params);
              }
            }

            // 去除loading
            yield put({
              type: 'loadingController',
              payload: {
                service,
                serviceGroup,
                type: 'delete'
              }
            });
          }
        }
      });
    },
  };

  // 返回model
  return {
    namespace,
    subscriptions: {
      ...subscriptions
    },
    state: {
      ...state,
      ...moreState,
    },
    effects: {
      ...effects,
      ...moreEffects
    },
    reducers: {
      ...reducers,
      ...moreReducers,
    }
  };
};
