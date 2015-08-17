'use strict';

var React = require('react-native');
var {
  Dimensions,
  View,
  Animated,
  ScrollView,
} = React;

var DefaultTabBar = require('./DefaultTabBar');
var deviceWidth = Dimensions.get('window').width;

var ScrollableTabView = React.createClass({
  getInitialState() {
    return { currentPage: 0, pan: new Animated.Value(0) };
  },

  componentWillMount() {
    this.state.pan.addListener(({value}) => {
      var pageNumber = Math.round(Math.max(0, Math.min(value / deviceWidth, this.props.children.length - 1)));

      this.setState({
        currentPage: pageNumber
      });

      this.props.onChangeTab && this.props.onChangeTab({
        i: pageNumber, ref: this.props.children[pageNumber]
      });
    });
  },

  goToPage(pageNumber) {
    this.refs.scrollView.scrollTo(null, pageNumber * deviceWidth);
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
    var scrollValue = this.state.pan.interpolate({
      inputRange: [0, deviceWidth * this.props.children.length], outputRange: [0, this.props.children.length]
    });

    return (
      <View style={{flex: 1}}>
        {this.renderTabBar({goToPage: this.goToPage,
                            tabs: this.props.children.map((child) => child.props.tabLabel),
                            activeTab: this.state.currentPage,
                            scrollValue: scrollValue})}
        <ScrollView
            style={{flex: 1}}
            automaticallyAdjustContentInsets={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {x: this.state.pan}}}]
            )}
            contentContainerStyle={{flex: 1}}
            pagingEnabled={true}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            ref="scrollView">
          {this.props.children}
        </ScrollView>
      </View>
    );
  }
});

module.exports = ScrollableTabView;
