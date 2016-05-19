import React from 'react';
import {
  Text,
} from 'react-native';

import ScrollableTabView from 'react-native-scrollable-tab-view';

export default React.createClass({
  render() {
    return <ScrollableTabView style={{marginTop: 20, }}>
      <Text tabLabel='Tab #1'>My</Text>
      <Text tabLabel='Tab #2'>favorite</Text>
      <Text tabLabel='Tab #3'>project</Text>
    </ScrollableTabView>;
  },
});
