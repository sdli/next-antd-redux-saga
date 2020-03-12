import App from 'next/app';
import React from 'react';
import withRedux from 'next-redux-wrapper';
import withReduxSaga from 'next-redux-saga';
import models from 'models';
import 'theme/default.less';

import createApp, { Provider, getInitialState } from 'store';
import Loading from 'components/loading';

// 配置组件汉化
import { LocaleProvider } from 'antd-mobile';
import en from 'antd-mobile/lib/locale-provider/en_US';

// locale语言包
import intl from 'react-intl-universal';
import 'intl/locale-data/jsonp/en';
import 'intl/locale-data/jsonp/zh';

// 项目语言包
import ZHCN from 'languages/zhCN';
import EN from 'languages/en';

import Router from 'next/router';

Router.events.on('routeChangeComplete', () => {
  if (process.env.NODE_ENV !== 'production') {
    const els = document.querySelectorAll('link[href*="/_next/static/chunks/styles.chunk.css"]');
    const timestamp = new Date().valueOf();

    (els[1] as any).href = `/_next/static/chunks/styles.chunk.css?v=${timestamp}`;
  }
});

const storeReady = (initialState = getInitialState(models), { isServer, req = null }: any) => {
  return createApp({ initialState, isServer, req }, models);
};

/**
 * 替换next.js的app应用
 */

const antdLocales = {
  zhCN: 1,
  en: en
};

const locales = {
  zhCN: ZHCN,
  en: EN
};

/**
 * 国际化组件
 */
class IntlComponent extends React.Component<any, any> {
  state = {
    ready: false
  };

  componentDidMount() {
    const { locale } = this.props;

    intl.init({
      currentLocale: locale,
      locales,
    }).then(() => {
      this.setState({
        ready: true
      });
    });
  }

  render() {
    const { children } = this.props;
    return (
      <>
        {this.state.ready && children}
      </>
    );
  }
}

class MyApp extends App<any, any> {

  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    const { query } = ctx;

    // 初始化组件的initialProps
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({ ctx });
    }

    // 加载本地化文件
    await intl.init({
      currentLocale: query && query.locale ? query && query.locale : 'zhCN',
      locales,
    });

    return { pageProps: { ...pageProps, locale: query && query.locale }, query };
  }

  render() {
    const { Component, pageProps, store } = this.props;
    const { locale = 'zhCN' } = pageProps;

    return (
      <Provider store={store}>
        <LocaleProvider locale={
          locale === 'zhCN'
            ? null
            : antdLocales[locale]}
        >
          <>
            <IntlComponent {...pageProps} locale={locale}>
              <Component {...pageProps} locale={locale} />
            </IntlComponent>
            <Loading />
          </>
        </LocaleProvider>
      </Provider>
    );
  }
}

export default withRedux(
  storeReady
)(
  withReduxSaga(
    MyApp
  )
);
