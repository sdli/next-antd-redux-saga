import * as sagaEffects from './effects';
import { ModelContentType } from './modelToStore';

const {
  put: initialPut,
  take: initialTake,
  takeEvery: initialTakeEvery,
  putResolve,
  ...rest
} = sagaEffects;

/**
 * 检测命名空间
 * @param {*} model
 */
function checkTypeNamespace(type: string, model: Record<string, any>) {
  if (type && type.indexOf('/') > -1) {
    return type;
  }
  return `${model.namespace}/${type}`;
}

/**
 * 自动补足命名空间
 * @param {*} model
 */
function getSagaEffects(model: ModelContentType) {
  if (model.namespace) {
    // eslint-disable-next-line no-inner-declarations
    const put: any = (obj: Record<string, any>) => {
      return initialPut({
        ...obj,
        type: checkTypeNamespace(obj.type, model)
      });
    };

    put.resolve = (obj: Record<string, any>) => {
      return (putResolve as any)({
        ...obj,
        type: checkTypeNamespace(obj.type, model)
      });
    };

    // eslint-disable-next-line no-inner-declarations
    const take = (obj: Record<string, any>) => {
      return initialTake(checkTypeNamespace(obj.type, model));
    };

    // eslint-disable-next-line no-inner-declarations
    const takeEvery = (obj: Record<string, any>, cb: (_: any) => any) => {
      return initialTakeEvery(checkTypeNamespace(obj.type, model), cb);
    };

    return {
      put,
      take,
      takeEvery,
      ...rest
    };
  }

  throw new Error('model should have namespace');
}

export { checkTypeNamespace };
export default getSagaEffects;
