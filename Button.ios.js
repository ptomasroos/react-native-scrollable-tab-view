import { TouchableOpacity } from 'react-native';

const Button = props => {
  return <TouchableOpacity {...props}>{props.children}</TouchableOpacity>;
};

export default Button;
