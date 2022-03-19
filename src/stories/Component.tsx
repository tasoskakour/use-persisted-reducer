import { Dispatch } from 'react';
import { Action, State } from './utils';

type Props = {
	state: State;
	dispatch: Dispatch<Action>;
};

const Component = (props: Props) => {
	const { state, dispatch } = props;

	const { counter, timestamp } = state || {};

	return (
		<div>
			Counter: {counter}
			<br />
			Timestamp: {new Date(timestamp).toLocaleString()}
			<br />
			<br />
			<button
				type="button"
				style={{ margin: 8 }}
				onClick={() => dispatch({ type: 'INCREASE' })}
			>
				Increase
			</button>
			<button
				type="button"
				style={{ margin: 8 }}
				onClick={() => dispatch({ type: 'DECREASE' })}
			>
				Decrease
			</button>
			<button type="button" style={{ margin: 8 }} onClick={() => dispatch({ type: 'RESET' })}>
				Reset
			</button>
			<div style={{ margin: 8 }}>
				Set{' '}
				<input
					onChange={(event) =>
						dispatch({
							type: 'SET',
							data: event.target.value.length === 0 ? 0 : Number(event.target.value),
						})
					}
				/>
			</div>
		</div>
	);
};

export default Component;
