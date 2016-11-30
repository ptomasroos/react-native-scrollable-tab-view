import React, {Component} from 'react';
import {
  Text,
  View,
} from 'react-native';

import ScrollableTabView, { ScrollableTabBar, } from 'react-native-scrollable-tab-view';

export default class ScrollableTabsExample extends Component {
  state = {
    tabs: ["Tab #1"]
  }

  render() {
    if (this.state.tabs.length == 1) {
      setTimeout(() => {
        this.setState({tabs: ["Tab #1", "Tab #2 word word", "Tab #3 word word word", "Tab #4 word word word word", "Tab #4 word word word word"]});
      }, 500);
    }

    return <ScrollableTabView
      style={{marginTop: 20, }}
      initialPage={0}
      renderTabBar={() => <ScrollableTabBar />}
    >
      <Text tabLabel="Today">Hello!</Text>
      {this.state.tabs.map((item, i) => {
        console.log('map')
        console.log(item)
      return <Text tabLabel={item}>{item}</Text>})}
    </ScrollableTabView>;
  }
}
