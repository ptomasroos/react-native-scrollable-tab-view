import React from 'react';
import {
  Text,
} from 'react-native';
import TimerMixin from 'react-timer-mixin';

import ScrollableTabView, { DefaultTabBar, } from 'react-native-scrollable-tab-view';

const Child = React.createClass({
  onEnter() {
    console.log(this.props.i);
  },

  render() {
    const i = this.props.i;
    return <Text key={i}>{`tab${i}`}</Text>;
  },
});

export default React.createClass({
  mixins: [TimerMixin, ],
  children: [],

  getInitialState() {
    return {
      tabs: [],
    };
  },

  componentDidMount() {
    this.setTimeout(
      () => { this.setState({ tabs: [1, 2, 3, ], }); },
      100
    );
  },

  handleChangeTab({i, ref, }) {
    this.children[i].onEnter();
  },

  render() {
    return <ScrollableTabView
      style={{marginTop: 20, }}
      renderTabBar={() => <DefaultTabBar />}
      onChangeTab={this.handleChangeTab}
    >
      {this.state.tabs.map((tab, i) => {
        return <Child
          ref={(ref) => this.children[i] = ref}
          tabLabel={`tab${i}`}
          i={i}
          key={i}
        />;
      })}
    </ScrollableTabView>;
  },
});
