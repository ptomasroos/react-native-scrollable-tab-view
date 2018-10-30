// @flow
import React from 'react';

type Props = {
  shouldUpdate?: boolean,
  children?: React.Node,
};

class StaticContainer extends React.Component<Props> {
  shouldComponentUpdate(nextProps) {
    return !!nextProps.shouldUpdate;
  }

  render() {
    const { children } = this.props;

    if (children === null || children === false) {
      return null;
    }

    return React.Children.only(children);
  }
}

export default StaticContainer;
