const React = require('react-native');
const {
  TouchableNativeFeedback,
  View,
} = React;

const Button = (props) => {
  return <TouchableNativeFeedback
    background={TouchableNativeFeedback.SelectableBackground()}
    {...props}
  >
    {props.children}
  </TouchableNativeFeedback>;
};

module.exports = Button;
