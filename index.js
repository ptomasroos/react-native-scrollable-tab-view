'use strict';

var React = require('react-native');
var {
  Dimensions,
  View,
  Animated,
  ScrollView,
  Platform,
  StyleSheet,
  ViewPagerAndroid,
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

    if(Platform.OS === 'ios') {
      var offset = pageNumber * deviceWidth
      this.scrollView.scrollTo(0, offset);
    } else {
      this.scrollView.setPage(pageNumber);
    }
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

  renderScrollableContent() {
    if(Platform.OS === 'ios') {
      return <ScrollView
        style={styles.scrollableContentIOS}
        horizontal={true}
        ref={(scrollView) => { this.scrollView = scrollView }}
        onScroll={(e) => {
          var offsetX = e.nativeEvent.contentOffset.x;
          this.state.scrollValue.setValue(offsetX / deviceWidth);
        }}
        scrollEventThrottle={16}
        directionalLockEnabled={true}
        pagingEnabled={true}>

        {this.props.children}
      </ScrollView>
    } else {
      return <ViewPagerAndroid
        style={styles.scrollableContentAndroid}
        onPageScroll={(e) => {
          const {offset, position} = e.nativeEvent;
          this.state.scrollValue.setValue(position + offset);
        }}
        ref={(scrollView) => { this.scrollView = scrollView }}>

        {this.props.children.map((child) => {
          return <View style={{width: deviceWidth}}>{child}</View>
        })}
      </ViewPagerAndroid>
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
      <View style={styles.container}>
        {this.props.tabBarPosition === 'top' ? this.renderTabBar(tabBarProps) : null}
        {this.renderScrollableContent()}
        {this.props.tabBarPosition === 'bottom' ? this.renderTabBar(tabBarProps) : null}
      </View>
    );
  }
});

module.exports = ScrollableTabView;

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollableContentIOS: {
    flexDirection: 'row',
  },
  scrollableContentAndroid: {
    flex: 1,
  },
});
