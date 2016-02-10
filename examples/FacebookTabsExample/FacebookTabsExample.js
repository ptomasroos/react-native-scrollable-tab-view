'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
  ScrollView,
} = React;

var FacebookTabBar = require('./FacebookTabBar');
var ScrollableTabView = require('react-native-scrollable-tab-view');
var {
  ScrollableTabBar,
  DefaultTabBar,
} =  ScrollableTabView;


var FacebookTabsExample = React.createClass({
  render() {
    return (
      <View style={styles.container}>
        <ScrollableTabView initialPage={1} renderTabBar={() => <FacebookTabBar />}>
          <ScrollView tabLabel="ion|ios-paper" style={styles.tabView}>
            <View style={styles.card}>
              <Text>News</Text>
            </View>
          </ScrollView>
          <ScrollView tabLabel="ion|person-stalker" style={styles.tabView}>
            <View style={styles.card}>
              <Text>Friends</Text>
            </View>
          </ScrollView>
          <ScrollView tabLabel="ion|ios-chatboxes" style={styles.tabView}>
            <View style={styles.card}>
              <Text>Messenger</Text>
            </View>
          </ScrollView>
          <ScrollView tabLabel="ion|ios-world" style={styles.tabView}>
            <View style={styles.card}>
              <Text>Notifications</Text>
            </View>
          </ScrollView>
          <ScrollView tabLabel="ion|navicon-round" style={styles.tabView}>
            <View style={styles.card}>
              <Text>Other nav</Text>
            </View>
          </ScrollView>
        </ScrollableTabView>
      </View>
    );
  }
});

var SimpleExample = React.createClass({
  render() {
    return (
      <ScrollableTabView style={{marginTop: 20}}>
        <Text tabLabel='Tab #1'>My</Text>
        <Text tabLabel='Tab #2'>favorite</Text>
        <Text tabLabel='Tab #3'>project</Text>
      </ScrollableTabView>
    )
  }
});

var ScrollableTabsExample = React.createClass({
  render() {
    return (
      <View style={styles.container}>
        <ScrollableTabView initialPage={0} renderTabBar={() => <ScrollableTabBar />}>
          <Text tabLabel='Tab #1'>My</Text>
          <Text tabLabel='Tab #2 word word'>favorite</Text>
          <Text tabLabel='Tab #3 word word word'>project</Text>
          <Text tabLabel='Tab #4 word word word word'>favorite</Text>
          <Text tabLabel='Tab #5'>project</Text>
        </ScrollableTabView>
      </View>
    )
  }
});

//module.exports = SimpleExample;
module.exports = ScrollableTabsExample;

var styles = StyleSheet.create({
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
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
});
