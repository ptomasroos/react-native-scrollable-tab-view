// @flow
import * as React from 'react';
import { View } from 'react-native';

import StaticContainer from './StaticContainer';

type Props = React.ElementConfig<typeof View> &
  React.ElementConfig<typeof StaticContainer>;

class SceneComponent extends React.Component<Props> {
  render() {
    const { shouldUpdated, children, ...props } = this.props;

    return (
      <View {...props}>
        <StaticContainer shouldUpdated={shouldUpdated}>
          {children}
        </StaticContainer>
      </View>
    );
  }
}

export default SceneComponent;
