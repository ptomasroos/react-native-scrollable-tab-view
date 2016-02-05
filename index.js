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
  PropTypes,
  InteractionManager,
} = React;

var DefaultTabBar = require('./DefaultTabBar');

var ScrollableTabView = React.createClass({
  statics: {
    DefaultTabBar,
  },

  propTypes: {
    tabBarPosition: PropTypes.oneOf(['top', 'bottom']),
    initialPage: PropTypes.number,
    page: PropTypes.number,
    onChangeTab: PropTypes.func,
    onScroll: PropTypes.func,
    renderTabBar: PropTypes.any,
    style: View.propTypes.style,
  },

  getDefaultProps() {
    return {
      tabBarPosition: 'top',
      initialPage: 0,
      page: -1,
      onChangeTab: () => {},
      onScroll: () => {}
    }
  },

  getInitialState() {
    return {
      currentPage: this.props.initialPage,
      scrollValue: new Animated.Value(this.props.initialPage),
      containerWidth: Dimensions.get('window').width,
    };
  },

  componentWillReceiveProps(props) {
    if (props.page >= 0 && props.page !== this.state.currentPage) {
      this.goToPage(props.page);
    }
  },

  goToPage(pageNumber) {
    this.props.onChangeTab({ i: pageNumber, ref: this._children()[pageNumber] });

    if(Platform.OS === 'ios') {
      var offset = pageNumber * this.state.containerWidth;
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
          contentContainerStyle={styles.scrollableContentContainerIOS}
          contentOffset={{x:this.props.initialPage * this.state.containerWidth}}
          ref={(scrollView) => { this.scrollView = scrollView }}
          onScroll={(e) => {
            var offsetX = e.nativeEvent.contentOffset.x;
            this._updateScrollValue(offsetX / this.state.containerWidth);
          }}
          onMomentumScrollBegin={(e) => {
            var offsetX = e.nativeEvent.contentOffset.x;
            this._updateSelectedPage(parseInt(offsetX / this.state.containerWidth));
          }}
          onMomentumScrollEnd={(e) => {
            var offsetX = e.nativeEvent.contentOffset.x;
            this._updateSelectedPage(parseInt(offsetX / this.state.containerWidth));
          }}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!this.props.locked}
          directionalLockEnabled
          alwaysBounceVertical={false}>
          {this._children().map((child,idx) => {
            return <View
              key={child.props.tabLabel + '_' + idx}
              style={{width: this.state.containerWidth}}>
              {child}
            </View>
            })}
        </ScrollView>
      );
    } else {
      return (
        <ViewPagerAndroid
         style={styles.scrollableContentAndroid}
         initialPage={this.props.initialPage}
         onPageSelected={this._updateSelectedPage}
         onPageScroll={(e) => {
           const {offset, position} = e.nativeEvent;
           this._updateScrollValue(position + offset);
         }}
         ref={(scrollView) => { this.scrollView = scrollView }}>
         {this._children().map((child,idx) => {
           return <View
             key={child.props.tabLabel + '_' + idx}
             style={{width: this.state.containerWidth}}>
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
    this.setState({currentPage}, () => {
      this.props.onChangeTab({ i: currentPage });
    });
  },

  _updateScrollValue(value) {
    this.state.scrollValue.setValue(value);
    this.props.onScroll(value);
  },

  _handleLayout(e) {
    var { width } = e.nativeEvent.layout;
    
    if (width !== this.state.containerWidth) {
      this.setState({containerWidth: width});
      InteractionManager.runAfterInteractions(() => {
        this.goToPage(this.state.currentPage);
      });
    }
  },

  _children() {
    return React.Children.map(this.props.children, (child) => child);
  },

  render() {
    var tabBarProps = {
      goToPage: this.goToPage,
      tabs: this._children().map((child) => child.props.tabLabel),
      activeTab: this.state.currentPage,
      scrollValue: this.state.scrollValue,
      containerWidth: this.state.containerWidth,
    };
    
    if (this.props.tabBarUnderlineColor) {
      tabBarProps.underlineColor = this.props.tabBarUnderlineColor;
    }
    if (this.props.tabBarBackgroundColor) {
      tabBarProps.backgroundColor = this.props.tabBarBackgroundColor;
    }
    if (this.props.tabBarActiveTextColor) {
      tabBarProps.activeTextColor = this.props.tabBarActiveTextColor;
    }
    if (this.props.tabBarInactiveTextColor) {
      tabBarProps.inactiveTextColor = this.props.tabBarInactiveTextColor;
    }
    
    return (
      <View style={[styles.container, this.props.style]} onLayout={this._handleLayout}>
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
  scrollableContentContainerIOS: {
    flex: 1,
  },
  scrollableContentIOS: {
    flexDirection: 'column',
  },
  scrollableContentAndroid: {
    flex: 1,
  },
});
