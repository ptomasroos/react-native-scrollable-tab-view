'use strict';

var React = require('react-native');
var {
  Dimensions,
  Text,
  View,
  TouchableOpacity,
  PanResponder,
  Animated,
  Platform,
  ViewPagerAndroid
} = React;

var DefaultTabBar = require('./DefaultTabBar');
var deviceWidth = Dimensions.get('window').width;

var ScrollableTabView = React.createClass({
  // Export DefaultTabBar
  statics: {
    DefaultTabBar: DefaultTabBar
  },

  getDefaultProps() {
    return {
      tabBarPosition: 'top',
      edgeHitWidth: 30,
      springTension: 50,
      springFriction: 10,
      useAlwaysScrollView: false
    };
  },

  getInitialState() {
    var currentPage = this.props.initialPage || 0;
    return { currentPage: currentPage, scrollValue: new Animated.Value(currentPage) };
  },

  componentWillMount() {
    var release = (e, gestureState) => {
      var relativeGestureDistance = gestureState.dx / deviceWidth,
          lastPageIndex = this.props.children.length - 1,
          vx = gestureState.vx,
          newPage = this.state.currentPage;

      if (relativeGestureDistance < -0.5 || (relativeGestureDistance < 0 && vx <= -0.5)) {
        newPage = newPage + 1;
      } else if (relativeGestureDistance > 0.5 || (relativeGestureDistance > 0 && vx >= 0.5)) {
        newPage = newPage - 1;
      }

      this.props.hasTouch && this.props.hasTouch(false);
      this.goToPage(Math.max(0, Math.min(newPage, this.props.children.length - 1)));
    }

    this._panResponder = PanResponder.create({
      // Claim responder if it's a horizontal pan
      onMoveShouldSetPanResponder: (e, gestureState) => {
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          if ((gestureState.moveX <= this.props.edgeHitWidth ||
              gestureState.moveX >= deviceWidth - this.props.edgeHitWidth) &&
                this.props.locked !== true) {
            this.props.hasTouch && this.props.hasTouch(true);
            return true;
          }
        }
      },

      // Touch is released, scroll to the one that you're closest to
      onPanResponderRelease: release,
      onPanResponderTerminate: release,

      // Dragging, move the view with the touch
      onPanResponderMove: (e, gestureState) => {
        var dx = gestureState.dx;
        var lastPageIndex = this.props.children.length - 1;

        // This is awkward because when we are scrolling we are offsetting the underlying view
        // to the left (-x)
        var offsetX = dx - (this.state.currentPage * deviceWidth);
        this.state.scrollValue.setValue(-1 * offsetX / deviceWidth);
      },
    });
  },

  goToPage(pageNumber) {
    this.props.onChangeTab && this.props.onChangeTab({
      i: pageNumber,
      ref: this.props.children[pageNumber]
    });

    this.setState({
      currentPage: pageNumber,
    });

    if( Platform.OS == 'android' && !this.props.useAlwaysScrollView )  {
      this.viewPager.setPage(pageNumber);
    }

    Animated.spring(this.state.scrollValue, {toValue: pageNumber, friction: this.props.springFriction, tension: this.props.springTension}).start();
  },

  /**
   * Method to handle ViewPager on Android
   *
   * @param  {Object} e
   */
  onPageScroll: function(e){
    var pageNumber = this.viewPager.state.selectedPage;

    if( pageNumber != this.state.currentPage ) {
      this.props.onChangeTab && this.props.onChangeTab({
        i: pageNumber,
        ref: this.props.children[pageNumber]
      });

      this.setState({
        currentPage: pageNumber,
      });

      Animated.spring(this.state.scrollValue, {toValue: pageNumber, friction: this.props.springFriction, tension: this.props.springTension}).start();
    }
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
    var sceneContainerStyle = {
      flex: 1,
      flexDirection: 'row'
    };
    
    // Adjust size only on iOS
    if( Platform.OS == 'ios' || this.props.useAlwaysScrollView ) {
      sceneContainerStyle.width = deviceWidth * this.props.children.length;
    }

    var translateX = this.state.scrollValue.interpolate({
      inputRange: [0, 1], outputRange: [0, -deviceWidth]
    });

    var tabBarProps = {
      goToPage: this.goToPage,
      tabs: this.props.children.map((child) => child.props.tabLabel),
      activeTab: this.state.currentPage,
      scrollValue: this.state.scrollValue
    };

    var component = (
      <Animated.View style={[sceneContainerStyle, {transform: [{translateX}]}]}
        {...this._panResponder.panHandlers}>
        {this.props.children}
      </Animated.View>
    );

    // Use ViewPager on Android
    if( Platform.OS == 'android' && !this.props.useAlwaysScrollView )  {
      component = (
        <ViewPagerAndroid ref={(vp) => { this.viewPager = vp; }}
          onPageScroll={this.onPageScroll}
          style={sceneContainerStyle}
          initialPage={this.state.currentPage}
          >
          {this.props.children}
        </ViewPagerAndroid>
      );
    }

    return (
      <View style={{flex: 1}}>
        {this.props.tabBarPosition === 'top' ? this.renderTabBar(tabBarProps) : null}
        {component}
        {this.props.tabBarPosition === 'bottom' ? this.renderTabBar(tabBarProps) : null}
      </View>
    );
  }
});

module.exports = ScrollableTabView;
