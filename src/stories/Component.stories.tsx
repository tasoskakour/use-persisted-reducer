import { Meta } from '@storybook/react';
import { createPersistedReducer } from '../components';
import { INITIAL_ARG, INITIAL_STATE, reducer } from './utils';
import Component from './Component';

// First case
const usePersistedReducer1 = createPersistedReducer('SessionStorage_test', {
	storage: window.sessionStorage,
});
export const SessionStorage = () => {
	const [state, dispatch] = usePersistedReducer1(reducer, INITIAL_STATE);

	return <Component state={state} dispatch={dispatch} />;
};

// Second case
const usePersistedReducer2 = createPersistedReducer('LocalStorageNoTTL_test');
export const LocalStorageNoTTL = () => {
	const [state, dispatch] = usePersistedReducer2(reducer, INITIAL_STATE);

	return <Component state={state} dispatch={dispatch} />;
};

// Third case
const usePersistedReducer3 = createPersistedReducer('LocalStorageNoTTLWithInitFunction_test');
export const LocalStorageNoTTLWithInitFunction = () => {
	const [state, dispatch] = usePersistedReducer3(reducer, INITIAL_ARG, (initializerArg) => ({
		counter: initializerArg,
		timestamp: Date.now(),
	}));

	return <Component state={state} dispatch={dispatch} />;
};

// Fourth case
const usePersistedReducer4 = createPersistedReducer('LocalStorageWithTTL_test', { ttl: 10 });
export const LocalStorageWithTTL = () => {
	const [state, dispatch /* isExpiredInitial */] = usePersistedReducer4(reducer, INITIAL_STATE);
	return <Component state={state} dispatch={dispatch} />;
};

// Fifth case
const usePersistedReducer5 = createPersistedReducer('LocalStorageWithTTLWithInitFunction_test', {
	ttl: 10,
});
export const LocalStorageWithTTLWithInitFunction = () => {
	const [state, dispatch] = usePersistedReducer5(reducer, INITIAL_ARG, (initializerArg) => ({
		counter: initializerArg,
		timestamp: Date.now(),
	}));

	return <Component state={state} dispatch={dispatch} />;
};

export default {
	title: 'Use Persisted Reducer',
	component: Component,
} as Meta;
