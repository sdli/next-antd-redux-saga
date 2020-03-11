import React from "react";
import { TabBar } from 'antd-mobile';
import { Link } from "store";
import styles from "./index.less";

// 修改icon时，可以查找public下的icon文件
const IconItem = ({ selected, link }: any) => {
    return <span className={styles.layout_icon}>
        <Link href={`/${link}`}>
            <a>
                <img src={`/icon/${link}${selected ? '_selected' : ''}.svg`} />
            </a>
        </Link>
    </span>
};

export default ({ children, tab }) => {

    return (
        <>

            {
                children
            }

            < div
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '60px',
                    boxShadow: '0 -4px 5px #ececec !important'
                }}
            >
                <TabBar
                    unselectedTintColor="#888"
                    tintColor="#366DF4"
                    barTintColor="white"
                >
                    <TabBar.Item
                        title="Index"
                        key="index"
                        selected={tab === 'index'}
                        icon={<IconItem selected={false} link="index" />}
                        selectedIcon={<IconItem selected link="index" />}
                    >
                    </TabBar.Item>
                    <TabBar.Item
                        title="User"
                        key="user"
                        selected={tab === 'user'}
                        icon={<IconItem selected={false} link="user" />}
                        selectedIcon={<IconItem selected link="user" />}
                    >
                    </TabBar.Item>
                </TabBar>
            </div >
        </>
    );


};