import React from "react";
import { connect, isServer } from 'store'
import Layout from "components/layout/layout.main";
import { Card, WingBlank, WhiteSpace, Tag, Button } from 'antd-mobile';
import intl from 'react-intl-universal';

class homePage extends React.Component<any, any> {
    static async getInitialProps({ ctx }) {

        const { store: { dispatch } } = ctx;

        // 服务端渲染操作
        // ！！注意，这里使用store.getState获取到的数据是初始值
        // ！！切勿直接使用getState获取
        // ！！如果要获取，请在model的effect中使用select获取
        dispatch({
            type: 'app/commonRequest', payload: {

                // 请求的service名称，对应请求地址
                service: 'app/getAppInfo',

                // 请求后数据的保存位置，这里代表：app->app.Info
                save: 'appInfo'
            }
        });

        return { title: 'Index Page' };
    }

    componentDidMount() {
        const { dispatch } = this.props;

        // !isServer() 来判断是否为客户端
        if (!isServer()) {

            setTimeout(() => {
                dispatch({
                    type: 'app/save',
                    payload: {
                        date: new Date().toLocaleString()
                    }
                })
            }, 1000);

        }
    }

    handleLanguageChange = () => {
        const { locale } = this.props;
        if (locale === 'zhCN') {
            window.location.href = '/index-en';
        } else {
            window.location.href = '/index';
        }
    }

    render() {
        const { appInfo, date, locale } = this.props;

        console.log(locale);
        return <Layout tab="index">
            <WingBlank size="lg">
                <WhiteSpace size="lg" />
                <div style={{ textAlign: "center" }}>
                    <h1>{intl.get('index-page-title')}</h1>
                    <div>你可以修改：<Tag selected={true}>/src/pages/index.tsx</Tag></div>
                </div>
                <WhiteSpace size="lg" />
                <WhiteSpace size="lg" />
                <WhiteSpace size="lg" />

                {/* 服务端渲染卡片 */}
                <Card>
                    <Card.Header
                        title="服务端渲染卡片"
                        extra={<span>getInitialProps</span>}
                    />
                    <Card.Body>
                        <div style={{ padding: '' }}>
                            <p>此卡片内容来自服务端渲染</p>
                            <p>服务端应用名：{appInfo.name}</p>
                            <p>服务端应用版本：{appInfo.version}</p>
                            <p>通过修改：<strong>index.tsx/getInitialProps</strong></p>
                        </div>
                    </Card.Body>
                </Card>

                {/* 客户端渲染卡片 */}
                <WhiteSpace size="lg" />
                <WhiteSpace size="lg" />
                {
                    date
                    &&
                    <Card>
                        <Card.Header
                            title="客户端渲染卡片"
                            extra={<span>componentDidMount</span>}
                        />
                        <Card.Body>
                            <div style={{ padding: '' }}>
                                <p>此卡片内容来自客户端渲染</p>
                                <p>当前日期：{date}</p>
                                <p>通过修改：<strong>index.tsx/componentDidMount</strong></p>
                            </div>
                        </Card.Body>
                    </Card>
                }

                <WhiteSpace size="lg" />
                <Button onClick={this.handleLanguageChange}>切换语言：{locale === 'zhCN' ? '英文' : '中文'}</Button>
            </WingBlank>
        </Layout>;
    }
}

export default connect((state) => ({
    appInfo: state.app.appInfo,
    date: state.app.date
}))(homePage);