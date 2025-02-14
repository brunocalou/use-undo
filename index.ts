import { useReducer, useCallback } from 'react';

enum ActionType {
  Undo = 'UNDO',
  Redo = 'REDO',
  Set = 'SET',
  Reset = 'RESET',
}

export interface Actions<T> {
  set: (newPresent: T) => void;
  reset: (newPresent: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface Action<T> {
  type: ActionType;
  newPresent?: T;
}

export interface State<T> {
  past: T[];
  present: T;
  future: T[];
}

const initialState = {
  past: [],
  present: null,
  future: [],
};

const reducer = <T>(state: State<T>, action: Action<T>) => {
  const { past, present, future } = state;

  switch (action.type) {
    case ActionType.Undo: {
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    }

    case ActionType.Redo: {
      const next = future[0];
      const newFuture = future.slice(1);

      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    }

    case ActionType.Set: {
      const { newPresent } = action;

      if (newPresent === present) {
        return state;
      }
      return {
        past: [...past, present],
        present: newPresent,
        future: [],
      };
    }

    case ActionType.Reset: {
      const { newPresent } = action;

      return {
        past: [],
        present: newPresent,
        future: [],
      };
    }
  }
};

const useUndo = <T>(initialPresent: T): [State<T>, Actions<T>] => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    present: initialPresent,
  }) as [State<T>, React.Dispatch<Action<T>>];

  const canUndo = state.past.length !== 0;
  const canRedo = state.future.length !== 0;
  const undo = useCallback(() => {
    if (canUndo) {
      dispatch({ type: ActionType.Undo });
    }
  }, [canUndo]);
  const redo = useCallback(() => {
    if (canRedo) {
      dispatch({ type: ActionType.Redo });
    }
  }, [canRedo]);
  const set = useCallback(
    (newPresent: T) => dispatch({ type: ActionType.Set, newPresent }),
    []
  );
  const reset = useCallback(
    (newPresent: T) => dispatch({ type: ActionType.Reset, newPresent }),
    []
  );

  return [state, { set, reset, undo, redo, canUndo, canRedo }];
};

export default useUndo;
