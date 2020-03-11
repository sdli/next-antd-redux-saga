import router from 'next/router';
import isServer from './isServer';

const getRealUrl = (url: string) => {

    if (!isServer()) {
        const pathname = window.location.pathname;
        const urls = url.split('?');
        if (pathname.endsWith('-en')) {
            // 没有参数
            if (urls.length === 1) {
                return `${url}-en`;
                // 有参数
            } else {
                return `${urls[0]}-en?${urls[1] || ''}`;
            }
        } else {
            return url;
        }
    } else {
        return url;
    }

};

const newRouter = {
    ...router,
    push: (url: any, as?: any, options?: any) => {
        const realUrl = getRealUrl(url);
        router.push(realUrl, as, options);
    }
};

export { getRealUrl };
export default newRouter;