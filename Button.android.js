const React = require('react');
const ReactNative = require('react-native');
const {
  TouchableNativeFeedback,
  View, Platform
} = ReactNative;

const API21 = (Platform.OS === "android" && Platform["Version"] >= 21);

const Button = (props) => {
  return <TouchableNativeFeedback
    delayPressIn={0}
    background={API21 ? TouchableNativeFeedback.SelectableBackgroundBorderless() : TouchableNativeFeedback.SelectableBackground()} // eslint-disable-line new-cap
    {...props}
  >
    {props.children}
  </TouchableNativeFeedback>;
};

module.exports = Button;
