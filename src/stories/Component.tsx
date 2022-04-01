import { Dispatch } from 'react';
import { Action, State } from './utils';

type Props = {
	state: State;
	dispatch: Dispatch<Action>;
};

const Component = (props: Props) => {
	const { state, dispatch } = props;

	const { counter, biggerCounter } = state || {};

	return (
		<div>
			<span id="counter">{counter}</span>
			<br />
			<span id="biggerCounter">{biggerCounter}</span>
			<br />
			<button
				id="increase"
				type="button"
				style={{ margin: 8 }}
				onClick={() => dispatch({ type: 'INCREASE' })}
			>
				Increase
			</button>
			<button
				id="decrease"
				type="button"
				style={{ margin: 8 }}
				onClick={() => dispatch({ type: 'DECREASE' })}
			>
				Decrease
			</button>
		</div>
	);
};

export default Component;
