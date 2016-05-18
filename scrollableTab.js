/* @flow */
'use strict';

import React, {
  Dimensions,
  View,
  Animated,
  ScrollView,
  Platform,
  StyleSheet,
  ViewPagerAndroid,
  PropTypes,
  InteractionManager,
} from 'react-native';

import TabBar from './tabBar';
import TabItem from './tabItem';

const {
  width: deviceWidth,
  height: deviceHeight
} = Dimensions.get('window');

const ScrollableTab = React.createClass({
  statics: {
    TabBar,
    TabItem
  },

  propTypes: {
    tabBarPosition: PropTypes.oneOf(['top', 'bottom']),
    initialPage: PropTypes.number,
    onChangeTab: PropTypes.func,
    onScroll: PropTypes.func,
    renderTabBar: PropTypes.any,
    style: View.propTypes.style,
  },

  getDefaultProps() {
    return {
      tabBarPosition: 'top',
      initialPage: 0,
      onChangeTab: () => {},
      onScroll: () => {}
    }
  },

  getInitialState() {
    return {
      currentPage: this.props.initialPage,
      scrollValue: new Animated.Value(this.props.initialPage),
      container: {
        width: deviceWidth,
        height: deviceHeight,
      }
    };
  },

  render() {
    var tabBarProps = {
      goToPage: this.goToPage,
      tabs: React.Children.map(this.props.children, child => child.props.tabLabel),
      activeTab: this.state.currentPage,
      scrollValue: this.state.scrollValue,
      underlineColor : this.props.tabBarUnderlineColor,
      backgroundColor : this.props.tabBarBackgroundColor,
      activeTextColor : this.props.tabBarActiveTextColor,
      inactiveTextColor : this.props.tabBarInactiveTextColor,
      containerWidth: this.state.container.width,
      smoothEnabled: this.state.smoothEnabled
    };

    return (
      <View style={[styles.container, this.props.style]} onLayout={this._handleLayout}>
        {this.props.tabBarPosition === 'top' ? this.renderTabBar(tabBarProps) : null}
        {this.renderScrollableContent()}
        {this.props.tabBarPosition === 'bottom' ? this.renderTabBar(tabBarProps) : null}
      </View>
    );
  },

  renderTabBar(props) {
    if (this.props.renderTabBar === false) {
      return null;
    }
    if (this.props.renderTabBar) {
      return React.cloneElement(this.props.renderTabBar(), props);
    }
    return <TabBar {...props} />;
  },

  renderScrollableContent() {
    const children = React.Children.map(
      this.props.children, (child, index) => {
      return React.cloneElement(child, {
        key: `item_${index}`,
        ref: `item_${index}`,
        index: index,
        style: {width: this.state.container.width}
      })
    });
    if (Platform.OS === 'ios') {
      return (
        <ScrollView
          ref={(scrollView) => { this.scrollView = scrollView }}
          horizontal={true}
          pagingEnabled={true}
          automaticallyAdjustContentInsets={false}
          style={styles.scrollableContentIOS}
          contentContainerStyle={styles.scrollableContentContainerIOS}
          onResponderGrant={this._handleResponderGrant}
          onResponderRelease={this._handleResponderRelease}
          onScroll={this._handleScroll}
          onMomentumScrollBegin={this._handleMomentumScrollBegin}
          onMomentumScrollEnd={this._handleMomentumScrollEnd}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!this.props.locked}
          directionalLockEnabled
          alwaysBounceVertical={false}>
          {children}
        </ScrollView>
      );
    }
    else {
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
          {children}
        </ViewPagerAndroid>
      );
    }
  },

  componentWillReceiveProps(props) {
    if (props.initialPage && props.initialPage !== this.state.currentPage) {
      this.goToPage(props.initialPage);
    }
  },

  goToPage(pageNumber) {
    this.props.onChangeTab({
      i: pageNumber,
      ref: this.props.children[pageNumber]
    });

    if (Platform.OS === 'ios') {
      var offset = pageNumber * this.state.container.width;
      this.scrollView.scrollTo({
        x: offset, y: 0, animated: false
      });
    }
    else {
      this.scrollView.setPage(pageNumber);
    }
  },

  _handleResponderGrant() {
    this.setState({smoothEnabled: false});
  },

  _handleResponderRelease() {
    this.timeoutToEnableSmooth = setTimeout(() => {
      this.setState({smoothEnabled: true});
    }, 100);
  },

  _handleScroll({nativeEvent:{contentOffset:{x: offsetX}}}) {
    this._updateScrollValue(offsetX / this.state.container.width);
    this._reactToContentOffsetX(offsetX);
  },

  _handleMomentumScrollBegin({nativeEvent:{contentOffset:{x: offsetX}}}) {
    clearTimeout(this.timeoutToEnableSmooth);
    this.timeoutToEnableSmooth = null;
  },

  _handleMomentumScrollEnd({nativeEvent:{contentOffset:{x: offsetX}}}) {
    this._updateSelectedPage(parseInt(offsetX / this.state.container.width));
    this.setState({smoothEnabled: true});
  },

  _handleLayout(e) {
    var {width, height} = e.nativeEvent.layout;
    var container = this.state.container;

    if (width !== container.width || height !== container.height) {
      this.setState({container: e.nativeEvent.layout});
      InteractionManager.runAfterInteractions(() => {
        this.goToPage(this.state.currentPage);
      });
    }

    this._reactToContentOffsetX(0);
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

  _reactToContentOffsetX(offsetX) {
    const scrollValue = offsetX / this.state.container.width;
    const scrollValueFloor = Math.floor(scrollValue);
    const scrollValueCeil = Math.ceil(scrollValue);
    React.Children.forEach(this.props.children, (child, index) => {
      let tabItem = this.refs['item_' + index];
      if (tabItem) {
        switch (index) {
          case scrollValueFloor:
          case scrollValueCeil: {
            tabItem.state && tabItem.state.active || (
              tabItem.state && tabItem.state.initialized || (
                tabItem.tabItemWillInitialize && (
                  tabItem.tabItemWillInitialize()
                ),
                tabItem.initialize && (
                  tabItem.initialize('ScrollableTab')
                ),
                tabItem.setState({
                  initialized: true
                }),
                tabItem.tabItemDidInitialize && (
                  tabItem.tabItemDidInitialize()
                )
              ),
              tabItem.tabItemWillActivate && (
                tabItem.tabItemWillActivate()
              ),
              tabItem.setState({
                active: true
              }),
              tabItem.tabItemDidActivate && (
                tabItem.tabItemDidActivate()
              )
            );
            return;
          }
        }
        tabItem.state && tabItem.state.active && (
          tabItem.tabItemWillDeactivate && (
            tabItem.tabItemWillDeactivate()
          ),
          tabItem.setState({
            active: false
          }),
          tabItem.tabItemDidDeactivate && (
            tabItem.tabItemDidDeactivate()
          )
        );
      }
    });
  },
});

export default ScrollableTab;

const styles = StyleSheet.create({
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
