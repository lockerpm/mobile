import React from 'react'
import {
  SwitchProps,
} from 'react-native'
import { useTheme } from 'app/services/context'
import CheckBox from '@react-native-community/checkbox'

type Variants = 'checkbox' | 'switch' | 'radio'

interface ToggleProps {
  /**
   * The variant of the toggle.
   * Options: "checkbox", "switch", "radio"
   * Default: "checkbox"
   */
  variant?: Variants
  /**
   * The value of the field. If true the component will be turned on.
   */
  value?: boolean
  /**
   * Invoked with the new value when the value changes.
   */
  onValueChange?: (SwitchProps['onValueChange'])
  /**
   * Disable touch
   */
  disabled?: boolean
}


/**
 * Renders a boolean input.
 * This is a controlled component that requires an onValueChange callback that updates the value prop in order for the component to reflect user actions. If the value prop is not updated, the component will continue to render the supplied value prop instead of the expected result of any user actions.
 */
export function Toggle(props: ToggleProps) {
  const {
    variant = 'checkbox',
    disabled,
    value,
    onValueChange,
  } = props
  const { colors } = useTheme()
  if (variant === 'checkbox') {
    return (
      <CheckBox
        tintColors={{ true: colors.secondaryText, false: colors.secondaryText }}
        onFillColor={colors.primary}
        tintColor={colors.secondaryText}
        onTintColor={colors.primary}
        animationDuration={0.2}
        onCheckColor={colors.white}
        style={{ width: 24, height: 24, alignSelf: 'flex-end' }}
        disabled={disabled}
        value={value}
        onValueChange={onValueChange}
      />
    )
  }
}
