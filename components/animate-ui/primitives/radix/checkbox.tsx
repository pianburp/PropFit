'use client';

import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { motion, SVGMotionProps, type HTMLMotionProps } from 'motion/react';

import { getStrictContext } from '@/lib/get-strict-context';
import { useControlledState } from '@/hooks/use-controlled-state';

type CheckboxContextType = {
  isChecked: boolean | 'indeterminate';
  setIsChecked: (checked: boolean | 'indeterminate') => void;
};

const [CheckboxProvider, useCheckbox] =
  getStrictContext<CheckboxContextType>('CheckboxContext');

type CheckboxProps = HTMLMotionProps<'button'> &
  Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, 'asChild'>;

function Checkbox({
  defaultChecked,
  checked,
  onCheckedChange,
  disabled,
  required,
  name,
  value,
  ...props
}: CheckboxProps) {
  const [isChecked, setIsChecked] = useControlledState({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onCheckedChange,
  });

  // Handler that only updates internal state - avoids double-triggering onCheckedChange
  const handleCheckedChange = React.useCallback(
    (newChecked: boolean | 'indeterminate') => {
      setIsChecked(newChecked);
    },
    [setIsChecked]
  );

  return (
    <CheckboxProvider value={{ isChecked, setIsChecked }}>
      <CheckboxPrimitive.Root
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        asChild
      >
        <motion.button
          type="button"
          data-slot="checkbox"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          {...props}
        />
      </CheckboxPrimitive.Root>
    </CheckboxProvider>
  );
}

type CheckboxIndicatorProps = SVGMotionProps<SVGSVGElement>;

function CheckboxIndicator(props: CheckboxIndicatorProps) {
  const { isChecked } = useCheckbox();

  return (
    <CheckboxPrimitive.Indicator forceMount asChild>
      <motion.svg
        data-slot="checkbox-indicator"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="3.5"
        stroke="currentColor"
        initial="unchecked"
        animate={isChecked ? 'checked' : 'unchecked'}
        {...props}
      >
        {isChecked === 'indeterminate' ? (
          <motion.line
            x1="5"
            y1="12"
            x2="19"
            y2="12"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: 1,
              transition: { duration: 0.2 },
            }}
          />
        ) : (
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
            variants={{
              checked: {
                pathLength: 1,
                opacity: 1,
                transition: {
                  duration: 0.2,
                  delay: 0.2,
                },
              },
              unchecked: {
                pathLength: 0,
                opacity: 0,
                transition: {
                  duration: 0.2,
                },
              },
            }}
          />
        )}
      </motion.svg>
    </CheckboxPrimitive.Indicator>
  );
}

export {
  Checkbox,
  CheckboxIndicator,
  useCheckbox,
  type CheckboxProps,
  type CheckboxIndicatorProps,
  type CheckboxContextType,
};
