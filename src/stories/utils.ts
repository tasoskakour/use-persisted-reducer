export type Action =
	| {
			type: 'INCREASE';
	  }
	| {
			type: 'DECREASE';
	  }
	| {
			type: 'SET';
			data: number;
	  }
	| { type: 'RESET' };

export type State = {
	counter: number;
	timestamp: number;
};

export const INITIAL_STATE = {
	counter: 0,
	timestamp: Date.now(),
};

export const reducer = (state: State, action: Action): State => {
	const { type } = action;

	switch (type) {
		case 'INCREASE':
			return {
				...state,
				counter: state.counter + 1,
				timestamp: Date.now(),
			};
		case 'DECREASE':
			return {
				...state,
				counter: state.counter - 1,
				timestamp: Date.now(),
			};
		case 'SET':
			return {
				...state,
				// eslint-disable-next-line unicorn/consistent-destructuring
				counter: action.data,
				timestamp: Date.now(),
			};
		case 'RESET':
			return {
				...state,
				...INITIAL_STATE,
			};

		default:
			throw new Error('Wrong type');
	}
};
