const React = require('react-native');
const {
 TouchableOpacity,
  View,
} = React;

const Button = (props) => {
  return <TouchableOpacity {...props}>
    {props.children}
  </TouchableOpacity>;
};

module.exports = Button;
