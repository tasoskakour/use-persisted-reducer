import { Meta } from '@storybook/react';
import { createPersistedReducer } from '../components';
import { INITIAL_STATE, reducer } from './utils';
import Component from './Component';

// First case
const usePersistedReducer1 = createPersistedReducer('SessionStorage', {
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
	const [state, dispatch] = usePersistedReducer3(reducer, INITIAL_STATE, () => INITIAL_STATE);

	return <Component state={state} dispatch={dispatch} />;
};

export default {
	title: 'Use Persisted Reducer',
	component: Component,
} as Meta;
