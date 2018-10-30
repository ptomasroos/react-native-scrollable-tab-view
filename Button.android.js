import React from 'react';
import { TouchableNativeFeedback } from 'react-native';

type Props = typeof TouchableNativeFeedback.props & {
  children?: React.Node,
};

class Button extends React.Component<Props> {
  render() {
    const { children, ...props } = this.props;

    return (
      <TouchableNativeFeedback
        delayPressIn={0}
        background={TouchableNativeFeedback.SelectableBackground()}
        {...props}
      >
        {children}
      </TouchableNativeFeedback>
    );
  }
}

export default Button;
