import { modelWithRequest } from 'store';

export default modelWithRequest(
    // serivces
    {},

    // model
    {
        namespace: 'user',

        state: {
            user: {
                name: '',
            },
        },

        reducers: {
        },

        effects: {
        }
    });
