/* global window */
import { Toast as Message } from 'antd-mobile';
import axios from 'axios';
import * as fetchJsonp from 'fetch-jsonp';
import { compile, parse } from 'path-to-regexp';
// import { stringify } from 'qs';
import config from 'configs';
import isServer from './isServer';

let timer = null;
const YQL = [];
const CORS = [];

export interface Options {
  method: string;
  url: string;
  data?: any;
  fetchType?: string;
  needToken?: boolean;
  needParse?: boolean;
  noGlobalError?: boolean;
}

const fetch = (options: Options) => {
  const {
    method = 'get', fetchType, needToken = false, needParse = true
  } = options;
  let { url, data } = options;

  const cloneData = data
    ? (Object.prototype.toString.call(data) === '[object Object]' ? { ...data } : [...data])
    : null;

  // 请求默认添加token参数
  if (needToken) {
    try {
      const userInfo = window.localStorage.getItem('userInfo');
      if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token && token.length > 0) {
          const key = 'session_id';
          cloneData[key] = token;
        }
      }
    } catch (e) {
      if (!isServer()) {
        Message.fail(e.message);
      }
    }
  }

  if (needParse) {
    try {
      let domin = '';
      const urlMatched = url.match(/[a-zA-z]+:\/\/[^/]*/);
      if (urlMatched) {
        [domin] = [...urlMatched];
        url = url.slice(domin.length);
      }
      const match = parse(url);
      url = compile(url)(data);
      for (const item of match) {
        if (item instanceof Object && item.name in cloneData) {
          delete cloneData[item.name];
        }
      }
      url = domin + url;
    } catch (e) {
      if (!isServer()) Message.fail(e.message);
    }
  }

  if (fetchType === 'JSONP') {
    return new Promise((resolve, reject) => {
      fetchJsonp
        .default(url)
        .then(res => res.json())
        .then(result => {
          resolve({ statusText: 'OK', status: 200, data: result });
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  // if (fetchType === 'YQL') {
  //   url = `http://query.yahooapis.com/v1/public/yql?q=select * from json where url='${
  //     options.url
  //     }?${encodeURIComponent(stringify(options.data))}'&format=json`;
  //   data = null;
  // }

  switch (method.toLowerCase()) {
    case 'get':
      return axios.get(url, {
        params: cloneData
      });
    case 'delete':
      return axios.delete(url, {
        data: cloneData
      });
    case 'post':
      return axios.post(url, cloneData);
    case 'put':
      return axios.put(url, cloneData);
    case 'patch':
      return axios.patch(url, cloneData);
    default:
      return axios(options as any);
  }
};

export default function request(options: Options) {
  const { fetchType } = options;
  const newOptions = {
    ...options,

    // 如果为服务端则自动匹配请求头为localhost
    url: isServer() && !(fetchType === 'JSONP') ? `http://localhost:${config.port}${options.url}` : options.url
  };

  if (options.url && options.url.indexOf('//') > -1) {
    const origin = `${options.url.split('//')[0]}//${
      options.url.split('//')[1].split('/')[0]}`;

    if (window.location.origin !== origin && !options.fetchType) {
      if (CORS && CORS.indexOf(origin) > -1) {
        newOptions.fetchType = 'CORS';
      } else if (YQL && YQL.indexOf(origin) > -1) {
        newOptions.fetchType = 'YQL';
      } else {
        newOptions.fetchType = 'JSONP';
      }
    }
  }

  return fetch(newOptions)
    .then((response: any) => {
      // const { statusText, status } = response;
      let data = options.fetchType === 'YQL'
        ? response.data.query.results.json
        : response.data;

      if (data instanceof Array || typeof data.code === 'undefined') {
        data = {
          code: 200,
          data: data,
          errorMessage: null
        };
      }

      const {
        code, errorMessage
      } = data;

      if (
        typeof code != 'undefined'
        && code != '0'
        && code != 'ok'
        && code != '200'
      ) {

        // 不需要全局错误提示
        if (options.noGlobalError) {
          return Promise.resolve({
            ...data
          });
        }

        let msg;
        // 请求200, 但是请求错误的情况
        switch (code.toString()) {
          case '400':
            msg = `[400]:${errorMessage}`;
            break;
          case '403':
            msg = '无权限';
            break;
          case '407':
            msg = '登录失效';
            // location.href = '';
            break;
          case '500':
            msg = '接口异常';
            break;
          case '502':
            msg = '系统维护中, 请稍后...';
            break;
          case '504':
            msg = '系统维护中, 请稍后...';
            break;
          default:
            msg = errorMessage;
        }

        return Promise.reject(new Error(msg));
      }

      if (errorMessage) {
        if (!isServer()) Message.fail(`[${code}]${errorMessage}`);
      }

      return Promise.resolve(data);
    })
    .catch(error => {
      const { response, message } = error;
      let msg = message;

      if (response && response instanceof Object) {
        // 请求失败的情况: 404, 500, ...
        const {
          status,
          data,
          statusText
        } = response;
        msg = data.message || statusText;

        if (status && status.toString().indexOf('5') > -1) {
          msg = '系统维护中, 请稍后...';
        }
      }

      // 网络错误直接跳转登录页
      if (message === 'Network Error') {
        return Promise.resolve(null);
      }

      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        if (!isServer()) Message.fail(msg);
      }, 500);
      return Promise.resolve({ data: null, code: 400, errorMessage: 'fail to quest' });
    });
}
