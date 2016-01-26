'use strict';

import React, {Component, View} from 'react-native';

class TabItem extends Component {
  static propTypes = {
    style: View.propTypes.style,
  };
  title = '<ScrollableTab.TabItem>';
  render() {
    const {children, index, ...props} = this.props;
    return (
      <View {...props}>
        {(index == 0 || this.state && this.state.initialized) && children}
      </View>
    );
  }
}

export default TabItem;
