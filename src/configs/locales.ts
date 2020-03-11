interface LocalesType {
    // App语言
    [key: string]: {
      // 对应的antd语言
      antd: string;
      // 对应的intl语言
      intl: string;
      // moment
      moment: string;
    };
  }
  
  // queryString保留key名
  const qsName = 'locale';
  
  // default
  const defaultLocale = 'zh_CN';
  
  // 不在下列配置区域内的语言声明将被忽略
  const locales: LocalesType = {
    ['zh_CN']: {
      antd: 'zh_CN',
      intl: 'zh',
      moment: 'zh-cn',
    },
    ['en_US']: {
      antd: 'en_US',
      intl: 'en',
      moment: 'en-US'
    },
  };
  
  export {
    qsName,
    defaultLocale,
    locales,
  };
  