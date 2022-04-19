// Code inspired from: https://github.com/donavon/use-persisted-state/blob/master/src/createGlobalState.js

/* eslint-disable no-restricted-syntax */
const globalState = {} as any;

export type GlobalState = {
	deregister: () => void;
	emit: (value: any) => void;
};

const createGlobalState = (key: string, thisCallback: any, initialValue: any): GlobalState => {
	if (!globalState[key]) {
		globalState[key] = { callbacks: [], value: initialValue };
	}
	globalState[key].callbacks.push(thisCallback);
	return {
		deregister() {
			const array = globalState[key].callbacks;
			const index = array.indexOf(thisCallback);
			if (index > -1) {
				array.splice(index, 1);
			}
		},
		emit(value: any) {
			if (globalState[key].value !== value) {
				globalState[key].value = value;
				for (const callback of globalState[key].callbacks) {
					if (thisCallback !== callback) {
						callback(value);
					}
				}
			}
		},
	};
};

export default createGlobalState;
