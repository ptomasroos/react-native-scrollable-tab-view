import React from 'react';
import {
  Text,
  View,
} from 'react-native';

import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';

export default () => {
  return <ScrollableTabView
    style={{ marginTop: 20 }}
    initialPage={0}
    renderTabBar={() => <ScrollableTabBar />}
  >
    <Text tabLabel='Tab #1'>My</Text>
    <Text tabLabel='Tab #2 word word'>favorite</Text>
    <Text tabLabel='Tab #3 word word word'>project</Text>
    <Text tabLabel='Tab #4 word word word word'>favorite</Text>
    <Text tabLabel='Tab #5'>project</Text>
  </ScrollableTabView>;
}
