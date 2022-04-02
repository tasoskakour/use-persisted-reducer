# @tasoskakour/use-persisted-reducer

![gh workflow](https://github.com/tasoskakour/use-persisted-reducer/actions/workflows/ci-cd.yml/badge.svg) 


> A custom React hook that provides multi tab/browser persistent state. With TTL support.

`use-persisted-reducer` is actually a function that accepts a `key`, an optional storage provider (defaults to `window.localStorage`) and an optional `ttl` parameter and returns a React hook with identical API as the classic _useReducer_.

## Features

- Persists the reducer's state to localStorage or sessionStorage.
- Automatically syncs state between tabs and/or browser windows.
- Shares state between multiple hooks on a page.
- Provides TTL support.

## Install

_Requires `react@16.8.0` or higher that includes hooks._

```console
yarn add @tasoskakour/use-persisted-reducer
```

or

```console
npm i @tasoskakour/use-persisted-reducer
```

## Example

Let's take a look at a standard counter example. As you'll see the created hook has **identical API** with the standard React's _useReducer_ hook.

```js
import createPersistedReducer from "@tasoskakour/use-persisted-reducer";

const useCounterPersistedReducer = createPersistedReducer("COUNTER", {
  storage: window.localStorage, // or window.sessionStorage (defaults to localStorage)
  ttl: 10 // optional ttl in seconds
});

const reducer = (state, action): State => {
  // your counter reducer...
};

const INITIAL_STATE = {
  // initial state...
};

// And then use it as you would normally use the basic React's useReducer hook
const App = () => {
  const [state, dispatch] = useCounterPersistedReducer(reducer, INITIAL_STATE);
  // or const [state, dispatch] = useCounterPersistedReducer(reducer, someArgument, someInitFunction);

  const { counter } = state;
  return (
    <div>
      Counter's value: {counter}
      <button onClick={() => dispatch({ type: "INCREASE" })}>Increase</button>
      <button onClick={() => dispatch({ type: "DECREASE" })}>Increase</button>
    </div>
  );
};

// Example taken from: https://reactjs.org/docs/hooks-reference.html#usereducer
```

## API

**- function createPersistedReducer (key, options): usePersistedReducer**

Parameters:
- `key` (string): The localStorage/sessionStorage key that the data will be written to.
- `options?` (Object): 
    - `storage?` (Storage): Can be localStorage/sessionStorage or whatever storage you prefer. Optional - defaults to `window.localStorage`
    - `ttl?` (number): Expressed in seconds and represents when the data in the storage will be considered stale. Optional - defaults to null which means there is no TTL so the persisted data will never be considered expired.

Returns:
- `usePersistedReducer` (Function): The returned function is a hook which can be used with the same API as the classic React's useReducer hook. See [Example](#example)
    
