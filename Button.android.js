const {
  TouchableNativeFeedback,
  View,
} = require('react-native');

const Button = (props) => {
  return <TouchableNativeFeedback
    background={TouchableNativeFeedback.SelectableBackground()}
    {...props}
  >
    {props.children}
  </TouchableNativeFeedback>;
};

module.exports = Button;
