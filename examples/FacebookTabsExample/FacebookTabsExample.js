import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Navigator,
  TouchableOpacity,
} from 'react-native';
import SimpleExample from './SimpleExample';
import ScrollableTabsExample from './ScrollableTabsExample';
import OverlayExample from './OverlayExample';
import FacebookExample from './FacebookExample';

export default React.createClass({
  render() {
    return <Navigator
      style={{flex: 1, }}
      initialRoute={{}}
      renderScene={this.renderScene}
    />;
  },

  renderScene(route, nav) {
    switch (route.id) {
    case 'simple':
      return <SimpleExample />;
    case 'scrollable':
      return <ScrollableTabsExample />;
    case 'overlay':
      return <OverlayExample />;
    case 'facebook':
      return <FacebookExample />;
    default:
      return <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => nav.push({id: 'simple', })}
        >
          <Text>Simple example</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => nav.push({id: 'scrollable', })}
        >
          <Text>Scrollable tabs example</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => nav.push({id: 'overlay', })}
        >
          <Text>Overlay example</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => nav.push({id: 'facebook', })}
        >
          <Text>Facebook tabs example</Text>
        </TouchableOpacity>
      </View>;
    }
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    alignItems: 'center',
  },
  button: {
    padding: 10,
  },
});
