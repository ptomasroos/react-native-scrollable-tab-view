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
  statics: {
    DefaultTabBar,
  },

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

    return {
      currentPage: currentPage,
      scrollValue: new Animated.Value(currentPage),
    };
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
    if (Platform.OS === 'ios') {
      return (
        <ScrollView
          horizontal
          pagingEnabled
          style={styles.scrollableContentIOS}
          ref={(scrollView) => { this.scrollView = scrollView }}
          onScroll={(e) => {
            var offsetX = e.nativeEvent.contentOffset.x;
            this._updateScrollValue(offsetX / deviceWidth);
          }}
          onMomentumScrollBegin={(e) => {
            var offsetX = e.nativeEvent.contentOffset.x;
            this._updateSelectedPage(parseInt(offsetX / deviceWidth));
          }}
          onMomentumScrollEnd={(e) => {
            var offsetX = e.nativeEvent.contentOffset.x;
            this._updateSelectedPage(parseInt(offsetX / deviceWidth));
          }}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!this.props.locked}
          directionalLockEnabled
          alwaysBounceVertical={false}>
          {this.props.children}
        </ScrollView>
      );
    } else {
      return (
        <ViewPagerAndroid
         style={styles.scrollableContentAndroid}
         onPageSelected={this._updateSelectedPage}
         onPageScroll={(e) => {
           const {offset, position} = e.nativeEvent;
           this._updateScrollValue(position + offset);
         }}
         ref={(scrollView) => { this.scrollView = scrollView }}>
         {this.props.children.map((child,idx) => {
           return <View
                    key={child.props.tabLabel + '_' + idx}
                    style={{width: deviceWidth}}>
                    {child}
                  </View>
         })}
        </ViewPagerAndroid>
      );
    }
  },

  _updateSelectedPage(currentPage) {
    if (typeof currentPage === 'object') {
      currentPage = currentPage.nativeEvent.position;
    }
    this.setState({currentPage});
  },

  _updateScrollValue(value) {
    this.state.scrollValue.setValue(value);
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
