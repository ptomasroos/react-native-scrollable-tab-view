import React from 'react';
import {
  Text,
  TouchableHighlight,
} from 'react-native';
import TimerMixin from 'react-timer-mixin';
import ScrollableTabView, { ScrollableTabBar, } from 'react-native-scrollable-tab-view';
import createReactClass from 'create-react-class';

const Child = createReactClass({
  onEnter() {
    console.log('enter: ' + this.props.i); // eslint-disable-line no-console
  },

  onLeave() {
    console.log('leave: ' + this.props.i); // eslint-disable-line no-console
  },

  render() {
    const i = this.props.i;
    return <Text key={i}>{`tab${i}`}</Text>;
  },
});

export default createReactClass({
  mixins: [TimerMixin, ],
  children: [],

  getInitialState() {
    return {
      tabs: [1, 2],
    };
  },

  componentDidMount() {
    this.setTimeout(
      () => { this.setState({ tabs: [1, 2, 3, 4, 5, 6, ], }); },
      100
    );
  },

  handleChangeTab({i, ref, from, }) {
    this.children[i].onEnter();
    this.children[from].onLeave();
  },

  renderTab(name, page, isTabActive, onPressHandler, onLayoutHandler) {
    return <TouchableHighlight
      key={`${name}_${page}`}
      onPress={() => onPressHandler(page)}
      onLayout={onLayoutHandler}
      style={{flex: 1, width: 100, }}
      underlayColor="#aaaaaa"
    >
      <Text>{name}</Text>
    </TouchableHighlight>;
  },

  render() {
    return <ScrollableTabView
      style={{marginTop: 20, }}
      renderTabBar={() => <ScrollableTabBar renderTab={this.renderTab}/>}
      onChangeTab={this.handleChangeTab}
    >
      {this.state.tabs.map((tab, i) => {
        return <Child
          ref={(ref) => (this.children[i] = ref)}
          tabLabel={`tab${i}`}
          i={i}
          key={i}
        />;
      })}
    </ScrollableTabView>;
  },
});
