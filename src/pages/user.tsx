import React from "react";
import { connect } from 'store'
import Layout from "components/layout/layout.main";
import { router } from 'store';
import { Button, WhiteSpace, WingBlank } from 'antd-mobile';
import intl from 'react-intl-universal';

class UserPage extends React.Component<any, any> {
    static async getInitialProps() {

        return { title: 'User Page' };
    }

    componentDidMount() {
    }

    handleIndex = () => {
        router.push('/');
    }

    render() {
        return <Layout tab="user">
            <WhiteSpace size="lg" />
            <WingBlank>
                <Button onClick={this.handleIndex} type="primary">{intl.get('user-page-btn')}</Button>
            </WingBlank>
        </Layout>;
    }
}

export default connect()(UserPage);