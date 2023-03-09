import {
  Box,
  Button,
  ButtonGroup,
  ButtonGroupProps,
  ButtonProps,
  useId,
  useRadio,
  useRadioGroup,
  UseRadioProps
} from '@chakra-ui/react';
import * as React from 'react';

interface RadioButtonGroupProps<T>
  extends Omit<ButtonGroupProps, 'onChange' | 'variant' | 'isAttached'> {
  name?: string;
  value?: T;
  defaultValue?: string;
  onChange?: (value: T) => void;
}

export function RadioButtonGroup<T extends string> (props: RadioButtonGroupProps<T>) {
  const { children, name, defaultValue, value, onChange, ...rest } = props;
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    defaultValue,
    value,
    onChange
  });

  const buttons = React.useMemo(
    () =>
      React.Children.toArray(children)
        .filter<React.ReactElement<RadioButtonProps>>(React.isValidElement)
        .map((button, index, array) => {
          const isFirstItem = index === 0;
          const isLastItem = array.length === index + 1;

          const styleProps = Object.assign({
            ...(isFirstItem && !isLastItem ? { borderRightRadius: 0 } : {}),
            ...(!isFirstItem && isLastItem ? { borderLeftRadius: 0 } : {}),
            ...(!isFirstItem && !isLastItem ? { borderRadius: 0 } : {}),
            ...(!isLastItem ? { mr: '-px' } : {})
          });

          return React.cloneElement(button, {
            ...styleProps,
            radioProps: getRadioProps({
              value: button.props.value,
              disabled: props.isDisabled || button.props.isDisabled
            })
          });
        }),
    [children, getRadioProps, props.isDisabled]
  );
  return (
    <ButtonGroup isAttached variant='outline' {...getRootProps(rest)}>
      {buttons}
    </ButtonGroup>
  );
}

interface RadioButtonProps extends ButtonProps {
  value: string;
  radioProps?: UseRadioProps;
}

export function RadioButton (props: RadioButtonProps) {
  const { radioProps, ...rest } = props;
  const { getInputProps, getCheckboxProps, getLabelProps } =
    useRadio(radioProps);
  const id = useId(undefined, 'radio-button');

  const inputProps = getInputProps();
  const checkboxProps = getCheckboxProps();
  const labelProps = getLabelProps();

  return (
    <Box
      as='label'
      cursor='pointer'
      {...labelProps}
      sx={{
        '.focus-visible + [data-focus]': {
          boxShadow: 'outline',
          zIndex: 1
        },
        '[data-checked]': {
          bg: 'gray.200'
        }
      }}
    >
      <input {...inputProps} aria-labelledby={id} />
      <Button
        id={id}
        as='div'
        _focus={{ boxShadow: 'none' }}
        {...checkboxProps}
        {...rest}
      />
    </Box>
  );
}