import React from 'react';
import Link from 'next/link';
import { getRealUrl } from './router';

const LinkComp = ({ href, children, ...rest }) => {
  const realUrl = getRealUrl(href);

  return (
    <Link href={realUrl} {...rest}>
      {children}
    </Link>
  );
};

export default LinkComp;
