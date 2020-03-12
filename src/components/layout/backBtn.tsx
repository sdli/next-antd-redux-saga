import React from 'react';
import { Button } from 'antd-mobile';


export default () => {

  // eslint-disable-next-line no-restricted-globals
  const goback = () => { history.go(-1); };

  return (
    <div className="fixed-foot">
      <div className="btn-fill-group">
        <Button icon="left" onClick={goback}>
          返回
        </Button>
      </div>
    </div>
  );
};
