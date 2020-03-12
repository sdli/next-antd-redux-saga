import React from 'react';
import { useReselector } from 'store';
import { ActivityIndicator } from 'antd-mobile';

export default () => {
  const loadingStatus = useReselector(
    state => state.app.loading,
    (...rest) => ([...rest])
  );

  const ifLoading = loadingStatus.some((v: any) => Object.keys(v).some((val: any) => v[val]));

  return <ActivityIndicator animating={ifLoading} toast />;
};
