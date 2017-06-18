import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import ScrollableTabView, { DefaultTabBar, } from 'react-native-scrollable-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';

export default React.createClass({
  render() {
    const collapsableComponent = (
      <View>
        <Icon name='logo-apple' color='black' size={100} style={styles.topIcon} />
        <Icon name='logo-android' color='#A4C639' size={100} style={styles.topIcon} />
      </View>
    );

    return <ScrollableTabView collapsableBar={collapsableComponent}
      tabBarBackgroundColor="white"
      renderTabBar={()=><DefaultTabBar />}
    >
      <View tabLabel='iOS'>
        <Icon name='logo-apple' color='black' size={300} style={styles.icon} />
        <Icon name='ios-phone-portrait' color='black' size={300} style={styles.icon} />
        <Icon name='logo-apple' color='#DBDDDE' size={300} style={styles.icon} />
        <Icon name='ios-phone-portrait' color='#DBDDDE' size={300} style={styles.icon} />
      </View>
      <View tabLabel='Android'>
        <Icon name='logo-android' color='#A4C639' size={300} style={styles.icon} />
        <Icon name='logo-android' color='black' size={300} style={styles.icon} />
        <Icon name='logo-android' color='#A4C639' size={300} style={styles.icon} />
      </View>
    </ScrollableTabView>;
  },
});

const styles = StyleSheet.create({
  icon: {
    width: 300,
    height: 300,
    alignSelf: 'center',
  },
  topIcon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
});
