import React from 'react';
import { TouchableOpacity } from 'react-native';

type Props = typeof TouchableOpacity.props & {
  children?: React.Node,
};

class Button extends React.Component<Props> {
  render() {
    const { children, ...props } = this.props;

    return <TouchableOpacity {...props}>{children}</TouchableOpacity>;
  }
}

export default Button;
