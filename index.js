const React = require('react');
const {
  PropTypes,
  Component,
} = React;
const ReactNative = require('react-native');
const {
  Dimensions,
  View,
  Animated,
  ScrollView,
  StyleSheet,
  InteractionManager,
} = ReactNative;
const TimerMixin = require('react-timer-mixin');

const SceneComponent = require('./SceneComponent');
const DefaultTabBar = require('./DefaultTabBar');
const ScrollableTabBar = require('./ScrollableTabBar');


const ScrollableTabView = React.createClass({
  mixins: [TimerMixin, ],
  statics: {
    DefaultTabBar,
    ScrollableTabBar,
  },

  propTypes: {
    tabBarPosition: PropTypes.oneOf(['top', 'bottom', 'overlayTop', 'overlayBottom', ]),
    initialPage: PropTypes.number,
    page: PropTypes.number,
    onChangeTab: PropTypes.func,
    onScroll: PropTypes.func,
    renderTabBar: PropTypes.any,
    style: View.propTypes.style,
    contentProps: PropTypes.object,
    scrollWithoutAnimation: PropTypes.bool,
    locked: PropTypes.bool,
    prerenderingSiblingsNumber: PropTypes.number,
    horizontal: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      tabBarPosition: 'top',
      initialPage: 0,
      page: -1,
      onChangeTab: () => {},
      onScroll: () => {},
      contentProps: {},
      scrollWithoutAnimation: false,
      locked: false,
      prerenderingSiblingsNumber: 0,
      horizontal: true,
    };
  },

  getInitialState() {
    const {
      width,
      height,
    } = Dimensions.get('window');
    const containerSize = this.props.horizontal ? width : height;

    return {
      currentPage: this.props.initialPage,
      scrollValue: new Animated.Value(this.props.initialPage),
      containerSize,
      sceneKeys: this.newSceneKeys({ currentPage: this.props.initialPage, }),
    };
  },

  componentWillReceiveProps(props) {
    if (props.children !== this.props.children) {
      this.updateSceneKeys({ page: this.state.currentPage, children: props.children, });
    }

    if (props.page >= 0 && props.page !== this.state.currentPage) {
      this.goToPage(props.page);
    }

    if (props.horizontal !== this.props.horizontal) {
      this._handleLayout();
    }
  },

  goToPage(pageNumber) {
    const offset = pageNumber * this.state.containerSize;
    if (this.scrollView) {
      const targetPosition = {
        x: this.props.horizontal ? offset : 0,
        y: this.props.horizontal ? 0 : offset,
        animated: !this.props.scrollWithoutAnimation,
      };
      this.scrollView.scrollTo(targetPosition);
    }

    const currentPage = this.state.currentPage;
    this.updateSceneKeys({
      page: pageNumber,
      callback: this._onChangeTab.bind(this, currentPage, pageNumber),
    });
  },

  renderTabBar(props) {
    if (this.props.renderTabBar === false) {
      return null;
    } else if (this.props.renderTabBar) {
      return React.cloneElement(this.props.renderTabBar(props), props);
    } else {
      return <DefaultTabBar {...props} />;
    }
  },

  updateSceneKeys({ page, children = this.props.children, callback = () => {}, }) {
    let newKeys = this.newSceneKeys({ previousKeys: this.state.sceneKeys, currentPage: page, children, });
    this.setState({currentPage: page, sceneKeys: newKeys, }, callback);
  },

  newSceneKeys({ previousKeys = [], currentPage = 0, children = this.props.children, }) {
    let newKeys = [];
    this._children(children).forEach((child, idx) => {
      let key = this._makeSceneKey(child, idx);
      if (this._keyExists(previousKeys, key) ||
        this._shouldRenderSceneKey(idx, currentPage)) {
        newKeys.push(key);
      }
    });
    return newKeys;
  },

  _shouldRenderSceneKey(idx, currentPageKey) {
    let numOfSibling = this.props.prerenderingSiblingsNumber;
    return (idx < (currentPageKey + numOfSibling + 1) &&
      idx > (currentPageKey - numOfSibling - 1));
  },

  _keyExists(sceneKeys, key) {
    return sceneKeys.find((sceneKey) => key === sceneKey);
  },

  _makeSceneKey(child, idx) {
    return child.props.tabLabel + '_' + idx;
  },

  _onScroll(e) {
    const contentOffset = e.nativeEvent.contentOffset;
    const offset = this.props.horizontal ? contentOffset.x : contentOffset.y;
    this._updateScrollValue(offset / this.state.containerSize);
  },

  renderScrollableContent() {
    const scenes = this._composeScenes();
    const offset = this.props.initialPage * this.state.containerSize;
    const contentOffset = {
      x: this.props.horizontal ? offset : 0,
      y: this.props.horizontal ? 0 : offset,
    };

    return <ScrollView
      horizontal={this.props.horizontal}
      pagingEnabled
      automaticallyAdjustContentInsets={false}
      contentOffset={contentOffset}
      ref={(scrollView) => { this.scrollView = scrollView; }}
      onScroll={(e) => this._onScroll(e)}
      onMomentumScrollBegin={this._onMomentumScrollBeginAndEnd}
      onMomentumScrollEnd={this._onMomentumScrollBeginAndEnd}
      scrollEventThrottle={16}
      scrollsToTop={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!this.props.locked}
      directionalLockEnabled
      alwaysBounceHorizontal={false}
      alwaysBounceVertical={false}
      keyboardDismissMode="on-drag"
      {...this.props.contentProps}
      >
      {scenes}
    </ScrollView>;
  },

  _composeScenes() {
    return this._children().map((child, idx) => {
      let key = this._makeSceneKey(child, idx);
      let dimension = this.props.horizontal ? 'width' : 'height';
      let style = { [dimension]: this.state.containerSize, };
      return <SceneComponent
        key={child.key}
        shouldUpdated={this._shouldRenderSceneKey(idx, this.state.currentPage)}
        style={style}
      >
        {this._keyExists(this.state.sceneKeys, key) ? child : <View tabLabel={child.props.tabLabel}/>}
      </SceneComponent>;
    });
  },

  _onMomentumScrollBeginAndEnd(e) {
    const contentOffset = e.nativeEvent.contentOffset;
    const offset = this.props.horizontal ? contentOffset.x : contentOffset.y;
    const page = Math.round(offset / this.state.containerSize);
    if (this.state.currentPage !== page) {
      this._updateSelectedPage(page);
    }
  },

  _updateSelectedPage(nextPage) {
    let localNextPage = nextPage;
    if (typeof localNextPage === 'object') {
      localNextPage = nextPage.nativeEvent.position;
    }

    const currentPage = this.state.currentPage;
    this.updateSceneKeys({
      page: localNextPage,
      callback: this._onChangeTab.bind(this, currentPage, localNextPage),
    });
  },

  _onChangeTab(prevPage, currentPage) {
    this.props.onChangeTab({
      i: currentPage,
      ref: this._children()[currentPage],
      from: prevPage,
    });
  },

  _updateScrollValue(value) {
    this.state.scrollValue.setValue(value);
    this.props.onScroll(value);
  },

  _handleLayout(e) {
    const {
      width,
      height,
    } = e ? e.nativeEvent.layout : Dimensions.get('window');
    const size = this.props.horizontal ? width : height;

    if (Math.round(size) !== Math.round(this.state.containerSize)) {
      this.setState({ containerSize: size, });
      this.requestAnimationFrame(() => {
        this.goToPage(this.state.currentPage);
      });
    }
  },

  _children(children = this.props.children) {
    return React.Children.map(children, (child) => child);
  },

  render() {
    let overlayTabs = (this.props.tabBarPosition === 'overlayTop' || this.props.tabBarPosition === 'overlayBottom');
    let tabBarProps = {
      goToPage: this.goToPage,
      tabs: this._children().map((child) => child.props.tabLabel),
      activeTab: this.state.currentPage,
      scrollValue: this.state.scrollValue,
      containerSize: this.state.containerSize,
    };

    if (this.props.tabBarBackgroundColor) {
      tabBarProps.backgroundColor = this.props.tabBarBackgroundColor;
    }
    if (this.props.tabBarActiveTextColor) {
      tabBarProps.activeTextColor = this.props.tabBarActiveTextColor;
    }
    if (this.props.tabBarInactiveTextColor) {
      tabBarProps.inactiveTextColor = this.props.tabBarInactiveTextColor;
    }
    if (this.props.tabBarTextStyle) {
      tabBarProps.textStyle = this.props.tabBarTextStyle;
    }
    if (this.props.tabBarUnderlineStyle) {
      tabBarProps.underlineStyle = this.props.tabBarUnderlineStyle;
    }
    if (overlayTabs) {
      tabBarProps.style = {
        position: 'absolute',
        left: 0,
        right: 0,
        [this.props.tabBarPosition === 'overlayTop' ? 'top' : 'bottom']: 0,
      };
    }

    return <View style={[styles.container, this.props.style, ]} onLayout={this._handleLayout}>
      {this.props.tabBarPosition === 'top' && this.renderTabBar(tabBarProps)}
      {this.renderScrollableContent()}
      {(this.props.tabBarPosition === 'bottom' || overlayTabs) && this.renderTabBar(tabBarProps)}
    </View>;
  },
});

module.exports = ScrollableTabView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollableContentAndroid: {
    flex: 1,
  },
});
