// @flow
import * as React from 'react';

type Props = {
  shouldUpdated?: boolean,
  children?: React.Node,
};

class StaticContainer extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return !!nextProps.shouldUpdated;
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
