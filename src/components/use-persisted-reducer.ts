import {
	Dispatch,
	Reducer,
	ReducerAction,
	ReducerState,
	useEffect,
	useMemo,
	useReducer,
	useRef,
} from 'react';
import createStorage, { ItemWithExpiry } from './storage';

export type Options = {
	storage?: Storage;
	ttl?: number;
};

const SYNC_ACTION = '__USE_PERSISTED_REDUCER_SYNC_ACTION__';

const middleware =
	<R extends Reducer<any, any>>(reducer: R) =>
	(state: ReducerState<R>, action: ReducerAction<R>): ReducerState<R> => {
		if (action?.type === SYNC_ACTION) {
			try {
				return action?.data;
			} catch (error) {
				console.error(error);
				return state;
			}
		}

		return reducer(state, action);
	};

const calcInitialState = <R extends Reducer<any, any>, I>(
	initializerArg: I & ReducerState<R>,
	initializer?: (argument: I & ReducerState<R>) => ReducerState<R>
) => {
	if (initializer && typeof initializer === 'function') {
		return initializer(initializerArg);
	}

	return initializerArg;
};

const usePersistedReducer = <R extends Reducer<any, any>>(
	reducer: R,
	initialState: ReducerState<R>,
	init: ((x: any) => ReducerState<R>) | undefined,
	key: string,
	options?: Options
): [ReducerState<R>, Dispatch<ReducerAction<R>>] => {
	const { ttl, storage = window.localStorage } = options || {};
	const isMounted = useRef(false);
	const isUpdateFromListener = useRef(false);
	const theStorage = useMemo(() => createStorage(key, storage, ttl), [key, storage, ttl]);
	const [state, dispatch] = useReducer(
		middleware(reducer),
		theStorage.get(calcInitialState(initialState, init))
	);

	useEffect(() => {
		if (!isMounted.current) {
			isMounted.current = true;
			return;
		}

		if (isUpdateFromListener.current) {
			console.log('Update from listener, returning...', isUpdateFromListener);
			isUpdateFromListener.current = false;
			return;
		}

		console.log('Setting with expiry..');
		theStorage.set(state);
	}, [state, key, theStorage]);

	// Register listener (only for localStorage)
	useEffect(() => {
		const listener = (event: StorageEvent) => {
			if (event.key === key) {
				console.log('STORAGE CHANGED', event);
				isUpdateFromListener.current = true;
				if (!event.newValue) {
					dispatch({
						type: SYNC_ACTION,
						data: null,
					} as any);
				} else {
					try {
						const parsed = JSON.parse(event.newValue) as ItemWithExpiry;
						dispatch({
							type: SYNC_ACTION,
							data: parsed?.value,
						} as any);
					} catch (error) {
						console.error(error);
					}
				}
			}
		};

		if (storage === window.localStorage) {
			window.addEventListener('storage', listener);
		}

		return () => {
			if (storage === window.localStorage) window.removeEventListener('storage', listener);
		};
	}, [key, storage]);

	return [state, dispatch];
};

const createPersistedReducer = (key: string, options?: Options) => {
	return <R extends Reducer<any, any>>(
		reducer: R,
		initialState: ReducerState<R>,
		init?: (x: any) => ReducerState<R>
	) => usePersistedReducer<R>(reducer, initialState, init, key, options);
};

export default createPersistedReducer;

/*
  
  const [state, dispatch] = usePersistedReducer('a-unique-key', aReducer, aInitialState);
  
  */
