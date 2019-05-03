'use babel';

import autocomplete from './autocomplete';

export default {
    getProvider() {
        return [autocomplete];
    }
};
