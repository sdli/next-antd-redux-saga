import React from 'react';
import dayjs from 'dayjs';

// 获取HOC组件信息
// 可在chrome的react组件面板中看到这个信息
const getDispalyName = (component: React.ComponentClass | React.FunctionComponent) => component.displayName || component.name || 'Component';

export interface CREATEPROPS {
    [key: string]: any;
}

export interface CREATESTATE {
    funcs: {
        [key: string]: Function;
    };
}

export interface CreatedProps {
    init: Function;
}

// 创建绑定类
const create = function (
    WrappedComponent: React.ComponentClass<{ [key: string]: any }, any> | React.FunctionComponent<{ [key: string]: any }>,
    ExposeSettings: { name: string; apis: string[] }
): any {
    class CreateWithMultiMethods extends React.Component<CREATEPROPS, CREATESTATE> {
        constructor(props: CREATEPROPS) {
            super(props);
            this.state = {
                funcs: {
                    init: this.init,
                },
            };
        }

        static displayName = `Inherited${getDispalyName(WrappedComponent)}`;

        /**
         * modal用于绑定
         * @param {React.ComponentClass} react的类信息
         */
        init = (target: React.ComponentClass) => {

            const { funcs } = this.state;
            this.setState({
                funcs: {
                    ...funcs,
                    ...this.funcs(
                        ExposeSettings.apis,
                        target,
                    ),
                },
            });
        };

        /**
         * 功能列表
         */
        funcs = (name: string[], target: React.ComponentClass): Record<string, any> => {
            return Object.assign.apply(
                null,
                (name as any).map(
                    (v: string): Record<string, any> => ({
                        [v]: target && (target as any)[v],
                    }),
                ),
            );
        };

        componentDidMount = () => {
            // const that = this;
            // setTimeout(() => that.forceUpdate(), 0);
        };

        render() {
            const { funcs } = this.state;
            const props = this.props ? this.props : {};

            // 合并form方法内容
            // 加入新扩展的方法
            const newProps = {
                ...props,
                [ExposeSettings.name]: {
                    ...funcs,
                },
            };

            return <WrappedComponent {...newProps} />;
        }
    }

    return CreateWithMultiMethods;
};

function getSpendTime({ span, startTime, endTime }: any) {
    let spend = '--:--:--';

    if (span) {
        spend = span;
    } else {
        if (startTime && endTime) {
            const diff = dayjs(endTime).diff(dayjs(startTime), 'second');
            const diffHours = parseInt((diff / 3600).toString(), 10);
            const diffMinutes = parseInt(((diff % 3600) / 60).toString(), 10);
            const diffSeconds = diff - diffHours * 3600 - diffMinutes * 60;

            spend = `${diffHours < 10 ? `0${diffHours}` : diffHours}:${diffMinutes < 10 ? `0${diffMinutes}` : diffMinutes}:${diffSeconds < 10 ? `0${diffSeconds}` : diffSeconds}`;
        }
    }

    return spend;
}

// 写入字符串操作
const lengthX = function (str: any) {
    const data = str.length ? str.toString() : '';

    let len = 0;
    for (let i = 0; i < data.length; i++) {
        if (data.charCodeAt(i) > 127 || data.charCodeAt(i) == 94) {
            len += 2;
        } else {
            len++;
        }
    }
    return len;
}

function scrollToTop() {
    if (window) {
        window.scrollTo(0, 0);
    }
}

export { scrollToTop, lengthX, getSpendTime, create }; 