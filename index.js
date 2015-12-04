'use strict';

var React = require('react-native');
var {
  Dimensions,
  Text,
  View,
  TouchableOpacity,
  PanResponder,
  Animated,
  ScrollView,
} = React;

var DefaultTabBar = require('./DefaultTabBar');
var deviceWidth = Dimensions.get('window').width;

var ScrollableTabView = React.createClass({
  getDefaultProps() {
    return {
      tabBarPosition: 'top',
      edgeHitWidth: 30,
      springTension: 50,
      springFriction: 10
    }
  },

  getInitialState() {
    var currentPage = this.props.initialPage || 0;
    return { currentPage: currentPage, scrollValue: new Animated.Value(currentPage) };
  },

  goToPage(pageNumber) {
    this.props.onChangeTab && this.props.onChangeTab({
      i: pageNumber, ref: this.props.children[pageNumber]
    });

    var offset = pageNumber * deviceWidth
    this.scroolView.scrollTo(0, offset);
    this.setState({currentPage: pageNumber});
  },

  renderTabBar(props) {
    if (this.props.renderTabBar === false) {
      return null;
    } else if (this.props.renderTabBar) {
      return React.cloneElement(this.props.renderTabBar(), props);
    } else {
      return <DefaultTabBar {...props} />;
    }
  },

  render() {
    var translateX = this.state.scrollValue.interpolate({
      inputRange: [0, 1], outputRange: [0, -deviceWidth]
    });

    var tabBarProps = {
      goToPage: this.goToPage,
      tabs: this.props.children.map((child) => child.props.tabLabel),
      activeTab: this.state.currentPage,
      scrollValue: this.state.scrollValue
    };

    return (
      <View style={{flex: 1}}>
        {this.props.tabBarPosition === 'top' ? this.renderTabBar(tabBarProps) : null}
        <ScrollView
          style={{flexDirection: 'row'}}
          horizontal={true}
          ref={(scroolView) => { this.scroolView = scroolView }}
          onScroll={(e) => {
            var offsetX = e.nativeEvent.contentOffset.x;
            this.state.scrollValue.setValue(offsetX / deviceWidth);
          }}
          scrollEventThrottle={16}
          pagingEnabled={true}>

          {this.props.children}
        </ScrollView>
        {this.props.tabBarPosition === 'bottom' ? this.renderTabBar(tabBarProps) : null}
      </View>
    );
  }
});

module.exports = ScrollableTabView;
