// @flow
import * as React from 'react';
import {
  Platform,
  TouchableOpacity,
  TouchableNativeFeedback,
} from 'react-native';

type Props = React.ElementConfig<typeof TouchableOpacity> & {
  children?: React.Node,
}; // TODO React.ElementProps<typeof TouchableNativeFeedback>

class Button extends React.Component<Props> {
  renderAndroid() {
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

  renderIOS() {
    const { children, ...props } = this.props;
    return <TouchableOpacity {...props}>{children}</TouchableOpacity>;
  }

  render() {
    if (Platform.OS === 'ios') {
      return this.renderIOS();
    } else {
      return this.renderAndroid();
    }
  }
}

export default Button;
