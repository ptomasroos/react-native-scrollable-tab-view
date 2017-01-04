const React = require('react');
const ReactNative = require('react-native');
const {
  TouchableNativeFeedback,
  View,
  Platform,
} = ReactNative;

const bg = Platform.Version >= 21 ? TouchableNativeFeedback.SelectableBackgroundBorderless() : TouchableNativeFeedback.SelectableBackground();

const Button = (props) => {
  return <TouchableNativeFeedback
    delayPressIn={0}
    background={bg} // eslint-disable-line new-cap
    {...props}
  >
    {props.children}
  </TouchableNativeFeedback>;
};

module.exports = Button;
