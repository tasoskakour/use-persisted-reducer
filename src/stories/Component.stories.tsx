import { Meta } from '@storybook/react';
import { createPersistedReducer } from '../components';
import { INITIAL_COUNTER_ARG, INITIAL_BIGGER_COUNTER_ARG, INITIAL_STATE, reducer } from './utils';
import Component from './Component';

// First case
const usePersistedReducer1 = createPersistedReducer('SessionStorage_test', {
	storage: window.sessionStorage,
});
const Instance1 = () => {
	const [state, dispatch] = usePersistedReducer1(reducer, INITIAL_STATE);
	return <Component state={state} dispatch={dispatch} />;
};
const Instance2 = () => {
	const [state, dispatch] = usePersistedReducer1(reducer, INITIAL_STATE);
	return <Component state={state} dispatch={dispatch} />;
};
export const SessionStorage = () => {
	return (
		<>
			<div id="instance1">
				Instance 1: <Instance1 />
			</div>

			<hr />
			<div id="instance2">
				Instance 2: <Instance2 />
			</div>
		</>
	);
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
	const [state, dispatch] = usePersistedReducer3(
		reducer,
		{ INITIAL_COUNTER_ARG, INITIAL_BIGGER_COUNTER_ARG },
		// eslint-disable-next-line no-shadow
		({ INITIAL_COUNTER_ARG, INITIAL_BIGGER_COUNTER_ARG }) => ({
			counter: -INITIAL_COUNTER_ARG,
			biggerCounter: -INITIAL_BIGGER_COUNTER_ARG,
		})
	);

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
	const [state, dispatch] = usePersistedReducer5(
		reducer,
		{ INITIAL_COUNTER_ARG, INITIAL_BIGGER_COUNTER_ARG },
		// eslint-disable-next-line no-shadow
		({ INITIAL_COUNTER_ARG, INITIAL_BIGGER_COUNTER_ARG }) => ({
			counter: -INITIAL_COUNTER_ARG,
			biggerCounter: -INITIAL_BIGGER_COUNTER_ARG,
		})
	);

	return <Component state={state} dispatch={dispatch} />;
};

export default {
	title: 'Use Persisted Reducer',
	component: Component,
} as Meta;
