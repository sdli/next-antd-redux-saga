import router from 'next/router';
import isServer from './isServer';

const getRealUrl = (url: string) => {

  if (!isServer()) {
    const {pathname} = window.location;
    const urls = url.split('?');
    if (pathname.endsWith('-en')) {
      // 没有参数
      if (urls.length === 1) {
        return `${url}-en`;
        // 有参数
      }
      return `${urls[0]}-en?${urls[1] || ''}`;

    }
    return url;

  }
  return url;


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
