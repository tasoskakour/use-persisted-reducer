import {
	Dispatch,
	MutableRefObject,
	Reducer,
	ReducerState,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import createGlobalState, { GlobalState } from './create-global-state';
import createStorage, { IStorage, ItemWithExpiry } from './storage';

export type Options = {
	storage?: Storage;
	ttl?: number;
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

const useStorageListener = (key: string, provider: Storage, setState: (newState: any) => void) => {
	useEffect(() => {
		const listener = (event: StorageEvent) => {
			if (event.key === key) {
				if (!event.newValue) {
					setState(null);
				} else {
					try {
						const parsed = JSON.parse(event.newValue) as ItemWithExpiry;
						setState(parsed?.value);
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
	}, [key, provider, setState]);
};

const useGlobalStateRef = (key: string, setState: (newState: any) => void, initialState: any) => {
	const globalStateRef = useRef<GlobalState | null>(null);
	useEffect(() => {
		globalStateRef.current = createGlobalState(key, setState, initialState);

		return () => {
			globalStateRef.current?.deregister();
		};
	}, [key, setState, initialState]);

	return globalStateRef;
};

const usePersistedReducer = <S, A, I = S>(
	key: string,
	options: Options | undefined,
	reducer: Reducer<S, A>,
	initializerArg: S | I,
	initializer?: (initialiazerArg: I | S) => S
): HookReturn<S, A> => {
	const { ttl, storage = window.localStorage } = options || {};

	const theStorage = useMemo(() => createStorage(key, storage, ttl), [key, storage, ttl]);
	const isExpiredInitialRef = useRef(false);
	const reducerRef = useRef(reducer);
	const initializerArgRef = useRef(initializerArg);
	const initialState = useMemo(
		() =>
			withInitState(theStorage, isExpiredInitialRef, initializer)(initializerArgRef.current),
		[theStorage, isExpiredInitialRef, initializer]
	);

	const [state, setState] = useState(initialState);

	const globalStateRef = useGlobalStateRef(key, setState, initialState);

	const persistentDispatch = useCallback<Dispatch<A>>(
		(action: A) => {
			// Calculate new state
			const newState = reducerRef.current(state, action);

			// Save to storage
			theStorage.set(newState);

			// Apply state
			setState(newState);

			globalStateRef.current?.emit(newState);
		},
		[theStorage, globalStateRef, state, reducerRef]
	);

	useStorageListener(key, storage, setState);

	return [state, persistentDispatch, isExpiredInitialRef.current];
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
