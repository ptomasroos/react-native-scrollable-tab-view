// @flow
import React from 'react';
import { View } from 'react-native';

import StaticContainer from './StaticContainer';

type Props = typeof View.props & typeof StaticContainer.props;

class SceneComponent extends React.Component<Props> {
  render() {
    const { shouldUpdated, children, ...props } = this.props;

    return (
      <View {...props}>
        <StaticContainer shouldUpdate={shouldUpdated}>
          {children}
        </StaticContainer>
      </View>
    );
  }
}

export default SceneComponent;
