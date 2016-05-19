import React from 'react';
import {
  StyleSheet,
  ScrollView,
} from 'react-native';

import ScrollableTabView, { DefaultTabBar, } from 'react-native-scrollable-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';

// Using tabBarPosition='overlayTop' or 'overlayBottom' lets the content show through a
// semitransparent tab bar. Note that if you build a custom tab bar component, its outer container
// must consume a 'style' prop (e.g. <View style={this.props.style}) to support this feature.
export default React.createClass({
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
  },
  icon: {
    width: 300,
    height: 300,
    alignSelf: 'center',
  },
});
