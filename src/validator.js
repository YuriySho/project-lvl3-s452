import _ from 'lodash';
import { string } from 'yup';

export default (state, stringUrl) => {
    if (stringUrl === '' || _.includes(state.input.flows, stringUrl)) {
        state.isValid = false;
        state.error = 'URL is present in rss flow!';
        return;
    }
    const schema = string().url();
    schema.isValid(stringUrl)
        .then((data) => {
            if (!data) {
                state.isValid = false;
                state.error = 'Value is not a valid url!';
            }
            if (data) {
                state.isValid = true;
                state.error = '';
                state.input.flows.push(state.input.url);
            }
        })
};