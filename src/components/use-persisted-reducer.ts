import {
	Dispatch,
	MutableRefObject,
	Reducer,
	ReducerAction,
	ReducerState,
	useEffect,
	useMemo,
	useReducer,
	useRef,
} from 'react';
import createStorage, { IStorage, ItemWithExpiry } from './storage';

export type Options = {
	storage?: Storage;
	ttl?: number;
	allowList?: string[];
	denyList?: string[];
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

const withInitState =
	<R extends Reducer<any, any>>(
		storage: IStorage,
		isExpiredInitialRef: MutableRefObject<boolean>,
		init: ((x: any) => ReducerState<R>) | undefined = (x: any) => x as ReducerState<R>
	) =>
	(initialState: ReducerState<R>) => {
		const { value, isExpired } = storage.get(initialState);

		if (!init) {
			throw new Error('Error: initialiazer is not a valid function.');
		}

		// eslint-disable-next-line no-param-reassign
		if (isExpired) isExpiredInitialRef.current = true;
		return isExpired || !value ? init(initialState) : value;
	};

export type HookReturn<S, A> = [state: S, dispatch: Dispatch<A>, cacheMiss: boolean];

const useSyncStorage = <S>(
	state: S,
	key: string,
	theStorage: IStorage,
	isMountedRef: MutableRefObject<boolean>,
	isUpdateFromListenerRef: MutableRefObject<boolean>,
	allowList?: string[],
	denyList?: string[]
) => {
	const allowListRef = useRef(allowList);
	const denyListRef = useRef(denyList);

	useEffect(() => {
		if (!isMountedRef.current) {
			// eslint-disable-next-line no-param-reassign
			isMountedRef.current = true;
			return;
		}

		if (isUpdateFromListenerRef.current) {
			// eslint-disable-next-line no-param-reassign
			isUpdateFromListenerRef.current = false;
			return;
		}

		theStorage.set(state, allowListRef.current, denyListRef.current);
	}, [state, key, theStorage, isMountedRef, isUpdateFromListenerRef]);
};

const useStorageListener = <A>(
	key: string,
	provider: Storage,
	isUpdateFromListenerRef: MutableRefObject<boolean>,
	dispatch: Dispatch<A>
) => {
	useEffect(() => {
		const listener = (event: StorageEvent) => {
			if (event.key === key) {
				// eslint-disable-next-line no-param-reassign
				isUpdateFromListenerRef.current = true;
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

		if (provider === window.localStorage) {
			window.addEventListener('storage', listener);
		}

		return () => {
			if (provider === window.localStorage) window.removeEventListener('storage', listener);
		};
	}, [key, provider, isUpdateFromListenerRef, dispatch]);
};

const usePersistedReducer = <S, A, I = S>(
	key: string,
	options: Options | undefined,
	reducer: Reducer<S, A>,
	initializerArg: S | I,
	initializer?: (initialiazerArg: I | S) => S
): HookReturn<S, A> => {
	const { ttl, storage = window.localStorage, allowList, denyList } = options || {};
	const isMountedRef = useRef(false);
	const isUpdateFromListenerRef = useRef(false);
	const theStorage = useMemo(() => createStorage(key, storage, ttl), [key, storage, ttl]);
	const isExpiredInitialRef = useRef(false);
	const [state, dispatch] = useReducer(
		middleware(reducer),
		initializerArg,
		withInitState(theStorage, isExpiredInitialRef, initializer)
	);

	useSyncStorage<S>(
		state,
		key,
		theStorage,
		isMountedRef,
		isUpdateFromListenerRef,
		allowList,
		denyList
	);

	useStorageListener<A>(key, storage, isUpdateFromListenerRef, dispatch);

	return [state, dispatch, isExpiredInitialRef.current];
};

export type IOverload = {
	<S, A>(reducer: Reducer<S, A>, initializerArg: S): HookReturn<S, A>;
	<S, A, I>(
		reducer: Reducer<S, A>,
		initializerArg: I,
		initializer: (_initializerArg: I) => S
	): HookReturn<S, A>;
};

function createPersistedReducer(key: string, options?: Options): IOverload;
function createPersistedReducer(key: string, options?: Options) {
	return <S, A, I = S>(
		reducer: Reducer<S, A>,
		initialiazerArg: I | S,
		initializer?: (_initialiazerArg: I | S) => S
	) => {
		return usePersistedReducer<S, A, I>(
			key,
			options,
			reducer,
			initialiazerArg as I,
			initializer
		);
	};
}

export default createPersistedReducer;
