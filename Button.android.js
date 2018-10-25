import { TouchableNativeFeedback } from 'react';

const Button = props => {
  return (
    <TouchableNativeFeedback
      delayPressIn={0}
      background={TouchableNativeFeedback.SelectableBackground()}
      {...props}
    >
      {props.children}
    </TouchableNativeFeedback>
  );
};

export default Button;
