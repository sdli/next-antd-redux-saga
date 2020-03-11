import React from 'react';
import { Button } from 'antd-mobile';

export default () => {
    return (
        <div className="fixed-foot">
            <div className="btn-fill-group">
                <Button icon="left" onClick={() => { history.go(-1) }}>
                    返回</Button>
            </div>
        </div>
    );
}