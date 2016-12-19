import React from 'react';
import {
  Text,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import ScrollableTabView, {DefaultTabBar, Tab, } from 'react-native-scrollable-tab-view';

export default React.createClass({
  render() {
    return (
      <ScrollableTabView
        style={{marginTop: 20, }}
        renderTabBar={() => <DefaultTabBar />}
      >
        <Tab tabLabel='TAB #1' icon={<Icon name='ios-paper' size={15}/>}>
          <Text>My</Text>
        </Tab>

        <Tab tabLabel='TAB #2' icon={<Icon name='ios-people' size={15}/>}>
          <Text>favorite</Text>
        </Tab>

        <Tab tabLabel='TAB #3' icon={<Icon name='ios-chatboxes' size={15}/>}>
          <Text>project</Text>
        </Tab>

    </ScrollableTabView>
    );
  },
});
