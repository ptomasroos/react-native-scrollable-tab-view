import React from 'react';
import {
  Text,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view';

export default React.createClass({
  render() {
    return <ScrollableTabView
      style={{marginTop: 20, }}
      renderTabBar={() => <DefaultTabBar />}
    >
      <Text tabLabel='TAB #1' icon={<Icon name='ios-paper' size={15}/>}>My</Text>
      <Text tabLabel='TAB #2' icon={<Icon name='ios-people' size={15}/>}>favorite</Text>
      <Text tabLabel='TAB #3' icon={<Icon name='ios-chatboxes' size={15}/>}>project</Text>
    </ScrollableTabView>;
  },
});
