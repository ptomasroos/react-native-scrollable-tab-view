const {
 TouchableOpacity,
  View,
} = require('react-native');

const Button = (props) => {
  return <TouchableOpacity {...props}>
    {props.children}
  </TouchableOpacity>;
};

module.exports = Button;
