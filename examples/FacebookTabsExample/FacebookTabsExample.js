import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';

import FacebookTabBar from './FacebookTabBar';
import ScrollableTabView, { DefaultTabBar, ScrollableTabBar, } from 'react-native-scrollable-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';

const FacebookTabsExample = React.createClass({
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

const SimpleExample = React.createClass({
  render() {
    return <ScrollableTabView style={{marginTop: 20, }}>
      <Text tabLabel='Tab #1'>My</Text>
      <Text tabLabel='Tab #2'>favorite</Text>
      <Text tabLabel='Tab #3'>project</Text>
    </ScrollableTabView>;
  },
});

const ScrollableTabsExample = React.createClass({
  render() {
    return <View style={styles.container}>
      <ScrollableTabView initialPage={0} renderTabBar={() => <ScrollableTabBar />}>
        <Text tabLabel='Tab #1'>My</Text>
        <Text tabLabel='Tab #2 word word'>favorite</Text>
        <Text tabLabel='Tab #3 word word word'>project</Text>
        <Text tabLabel='Tab #4 word word word word'>favorite</Text>
        <Text tabLabel='Tab #5'>project</Text>
      </ScrollableTabView>
    </View>;
  },
});

// Using tabBarPosition='overlayTop' or 'overlayBottom' lets the content show through a
// semitransparent tab bar. Note that if you build a custom tab bar component, its outer container
// must consume a 'style' prop (e.g. <View style={this.props.style}) to support this feature.
const OverlayExample = React.createClass({
  render() {
    return <ScrollableTabView
      style={styles.container}
      renderTabBar={()=><DefaultTabBar backgroundColor='rgba(255, 255, 255, 0.7)' />}
      tabBarPosition='overlayTop'
    >
      <ScrollView tabLabel='iOS'>
        <Icon name='social-apple' color='#DBDDDE' size={300} style={styles.icon} />
        <Icon name='social-apple-outline' color='#DBDDDE' size={300} style={styles.icon} />
        <Icon name='ipad' color='#DBDDDE' size={300} style={styles.icon} />
        <Icon name='iphone' color='#DBDDDE' size={300} style={styles.icon} />
        <Icon name='ipod' color='#DBDDDE' size={300} style={styles.icon} />
      </ScrollView>
      <ScrollView tabLabel='Android'>
        <Icon name='social-android' color='#A4C639' size={300} style={styles.icon} />
        <Icon name='social-android-outline' color='#A4C639' size={300} style={styles.icon} />
        <Icon name='android-playstore' color='#A4C639' size={300} style={styles.icon} />
      </ScrollView>
    </ScrollableTabView>;
  },
});

//export default FacebookTabsExample;
//export default SimpleExample;
export default ScrollableTabsExample;
//export default OverlayExample;

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
  icon: {
    width: 300,
    height: 300,
    alignSelf: 'center',
  },
});
