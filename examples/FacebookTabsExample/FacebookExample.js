import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';

import FacebookTabBar from './FacebookTabBar';
import ScrollableTabView from 'react-native-scrollable-tab-view';

export default React.createClass({
  render() {
    return <View style={styles.container}>
      <ScrollableTabView initialPage={1} renderTabBar={() => <FacebookTabBar />}>
        <ScrollView tabLabel="ios-paper" style={styles.tabView}>
          <View style={styles.card}>
            <Text>News</Text>
          </View>
        </ScrollView>
        <ScrollView tabLabel="person-stalker" style={styles.tabView}>
          <View style={styles.card}>
            <Text>Friends</Text>
          </View>
        </ScrollView>
        <ScrollView tabLabel="ios-chatboxes" style={styles.tabView}>
          <View style={styles.card}>
            <Text>Messenger</Text>
          </View>
        </ScrollView>
        <ScrollView tabLabel="ios-world" style={styles.tabView}>
          <View style={styles.card}>
            <Text>Notifications</Text>
          </View>
        </ScrollView>
        <ScrollView tabLabel="navicon-round" style={styles.tabView}>
          <View style={styles.card}>
            <Text>Other nav</Text>
          </View>
        </ScrollView>
      </ScrollableTabView>
    </View>;
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
  },
  tabView: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  card: {
    borderWidth: 1,
    backgroundColor: '#fff',
    borderColor: 'rgba(0,0,0,0.1)',
    margin: 5,
    height: 150,
    padding: 15,
    shadowColor: '#ccc',
    shadowOffset: { width: 2, height: 2, },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
});
