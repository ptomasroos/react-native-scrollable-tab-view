const React = require('react');
const ReactNative = require('react-native');
const {
 TouchableOpacity,
} = ReactNative;

const Button = (props) => {
  return (
   <TouchableOpacity {...props}>
    {props.children}
   </TouchableOpacity>
  );
};

module.exports = Button;
