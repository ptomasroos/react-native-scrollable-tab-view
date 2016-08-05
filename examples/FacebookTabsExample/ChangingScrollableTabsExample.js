import React from 'react';
import {
  Text,
  View,
  TouchableHighlight,
} from 'react-native';

import ScrollableTabView, { ScrollableTabBar, } from 'react-native-scrollable-tab-view';

export default React.createClass({
  getInitialState() {
    return {
        tabs: [ 'short', 'list' ],
    };
  },

  render() {
    return (
        <ScrollableTabView
            renderTabBar = { () => <ScrollableTabBar /> }
        >
            {
                this.state.tabs.map(
                    (tab,index) =>
                    (
                        <View
                            tabLabel = { tab }
                            key = {index}
                        >
                            <TouchableHighlight
                                onPress = { () => this.setState({ tabs: [ 'short', 'list' ]})}
                            >
                                <Text> { 'short' } </Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                onPress = { () => this.setState({ tabs: [ 'long', 'list', 'with', 'very', 'many long tabs forcing', 'it to', 'scroll', 'and even longer' ]})}
                            >
                                <Text> { 'long' } </Text>
                            </TouchableHighlight>

                        </View>
                    )
                )
            }
        </ScrollableTabView>
    );
  },
});
