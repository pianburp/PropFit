import * as React from 'react';

interface CommonControlledStateProps<T> {
  value?: T;
  defaultValue?: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useControlledState<T, Rest extends any[] = []>(
  props: CommonControlledStateProps<T> & {
    onChange?: (value: T, ...args: Rest) => void;
  },
): readonly [T, (next: T, ...args: Rest) => void] {
  const { value, defaultValue, onChange } = props;

  // Track if component is in controlled mode
  const isControlled = value !== undefined;

  const [internalState, setInternalState] = React.useState<T>(
    value !== undefined ? value : (defaultValue as T),
  );

  // Use controlled value if provided, otherwise use internal state
  const state = isControlled ? value : internalState;

  const setState = React.useCallback(
    (next: T, ...args: Rest) => {
      // Only update internal state if uncontrolled
      if (!isControlled) {
        setInternalState(next);
      }
      // Always call onChange to notify parent
      onChange?.(next, ...args);
    },
    [isControlled, onChange],
  );

  return [state, setState] as const;
}
