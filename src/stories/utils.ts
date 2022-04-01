export type Action =
	| {
			type: 'INCREASE';
	  }
	| {
			type: 'DECREASE';
	  };

export type State = {
	counter: number;
	biggerCounter: number;
};

export const INITIAL_STATE = {
	counter: 0,
	biggerCounter: 10,
};

export const INITIAL_COUNTER_ARG = 0;
export const INITIAL_BIGGER_COUNTER_ARG = 10;

export const reducer = (state: State, action: Action): State => {
	const { type } = action;

	switch (type) {
		case 'INCREASE':
			return {
				...state,
				counter: state.counter + 1,
				biggerCounter: state.biggerCounter + 1,
			};
		case 'DECREASE':
			return {
				...state,
				counter: state.counter + 1,
				biggerCounter: state.biggerCounter + 1,
			};

		default:
			throw new Error('Wrong type');
	}
};
