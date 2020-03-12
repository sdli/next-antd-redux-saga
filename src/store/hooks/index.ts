import { createSelector, defaultMemoize, createSelectorCreator } from 'reselect';
import { useSelector, useDispatch } from 'react-redux';

const useReselector = (cb: Function | Function[], ...rest) => {
  const reSelector = createSelector.apply(null, [cb, ...rest]);
  return useSelector(state => reSelector(state));
};

export {
  createSelector, createSelectorCreator, defaultMemoize, useSelector, useDispatch, useReselector
};
