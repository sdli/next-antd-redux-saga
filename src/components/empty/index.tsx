import React from 'react';
import styles from './index.less';

export default ({ title, subTitle }: any) => {
  return (
    <div className={styles.empty}>
      <img src="/icon/empty.svg" alt="空标签图标" />
      <p className={styles.title}>{title || '暂无数据'}</p>
      {
        subTitle
        && <p className={styles['sub-title']}>{subTitle}</p>
      }
    </div>
  );
};
