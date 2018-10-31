// @flow
import React from 'react';
import {
  Dimensions,
  View,
  Animated,
  ScrollView,
  Platform,
  StyleSheet,
  ViewPagerAndroid,
  InteractionManager,
  ViewPropTypes,
} from 'react-native';

import SceneComponent from './SceneComponent';
import DefaultTabBar from './DefaultTabBar';
import ScrollableTabBar from './ScrollableTabBar';

// Animated.add and Animated.divide do not currently support listeners so
// we have to polyfill it here since a lot of code depends on being able
// to add a listener to `scrollValue`. See https://github.com/facebook/react-native/pull/12620.
function polyfillAnimatedValue(animatedValue) {
  const listeners = new Set();
  const addListener = listener => {
    listeners.add(listener);
  };

  const removeListener = listener => {
    listeners.delete(listener);
  };

  const removeAllListeners = () => {
    listeners.clear();
  };

  animatedValue.addListener = addListener;
  animatedValue.removeListener = removeListener;
  animatedValue.removeAllListeners = removeAllListeners;

  return value => listeners.forEach(listener => listener({ value }));
}

const AnimatedViewPagerAndroid =
  Platform.OS === 'android'
    ? Animated.createAnimatedComponent(ViewPagerAndroid)
    : undefined;

const WINDOW_WIDTH = Dimensions.get('window').width;

type ViewProps = React.ElementProps<typeof View>;
type ViewStyleProp = $PropertyType<ViewProps, 'style'>;

type TabBarPosition = 'top' | 'bottom' | 'overlayTop' | 'overlayBottom';

type Props = typeof DefaultTabBar &
  typeof ScrollableTabBar & {
    tabBarPosition: TabBarPosition,
    initialPage: number,
    page: number,
    onChangeTab: Function,
    onScroll: Function,
    renderTabBar: Function,
    style: ViewStyleProp,
    contentProps: Object,
    scrollWithoutAnimation: boolean,
    locked: boolean,
    prerenderingSiblingsNumber: number,
  };

class ScrollableTabView extends React.Component<Props> {
  constructor(props) {
    super(props);

    const { initialPage } = props;

    this.scrollOnMountCalled = false;

    if (Platform.OS === 'ios') {
      const scrollXIOS = new Animated.Value(initialPage * WINDOW_WIDTH);
      const containerWidthAnimatedValue = new Animated.Value(WINDOW_WIDTH);
      const scrollValue = Animated.divide(
        scrollXIOS,
        containerWidthAnimatedValue,
      );

      const callListeners = polyfillAnimatedValue(scrollValue);
      scrollXIOS.addListener(({ value }) =>
        callListeners(value / this.state.containerWidth),
      );

      this.state = {
        scrollValue,
        scrollXIOS,
        containerWidth: WINDOW_WIDTH,
        sceneKeys: this.newSceneKeys({ currentPage: initialPage }),
      };
    } else {
      const positionAndroid = new Animated.Value(initialPage);
      const offsetAndroid = new Animated.Value(0);
      const scrollValue = Animated.add(positionAndroid, offsetAndroid);

      const callListeners = polyfillAnimatedValue(scrollValue);
      const positionAndroidValue = initialPage;
      const offsetAndroidValue = 0;

      positionAndroid.addListener(({ value }) => {
        positionAndroidValue = value;
        callListeners(positionAndroidValue + offsetAndroidValue);
      });

      offsetAndroid.addListener(({ value }) => {
        offsetAndroidValue = value;
        callListeners(positionAndroidValue + offsetAndroidValue);
      });

      this.state = {
        scrollValue,
        positionAndroid,
        offsetAndroid,
        containerWidth: WINDOW_WIDTH,
        sceneKeys: this.newSceneKeys({ currentPage: initialPage }),
      };
    }
  }

  static defaultProps = {
    tabBarPosition: 'top',
    initialPage: 0,
    page: -1,
    onChangeTab: () => {},
    onScroll: () => {},
    contentProps: {},
    scrollWithoutAnimation: false,
    locked: false,
    prerenderingSiblingsNumber: 0,
  };

  componentDidUpdate(prevProps) {
    const { prevChildren } = prevProps;
    const { children, page } = this.props;
    const { currentPage } = this.state;

    if (children !== prevChildren) {
      this.updateSceneKeys({
        page: currentPage,
        children,
      });
    }

    if (page >= 0 && page !== currentPage) {
      this.goToPage(page);
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'ios') {
      const { scrollXIOS } = this.state;
      scrollXIOS.removeAllListeners();
    } else {
      const { positionAndroid, offsetAndroid } = this.state;
      positionAndroid.removeAllListeners();
      offsetAndroid.removeAllListeners();
    }
  }

  goToPage = pageNumber => {
    if (Platform.OS === 'ios') {
      const offset = pageNumber * this.state.containerWidth;
      if (this.scrollView) {
        this.scrollView.getNode().scrollTo({
          x: offset,
          y: 0,
          animated: !this.props.scrollWithoutAnimation,
        });
      }
    } else {
      if (this.scrollView) {
        if (this.props.scrollWithoutAnimation) {
          this.scrollView.getNode().setPageWithoutAnimation(pageNumber);
        } else {
          this.scrollView.getNode().setPage(pageNumber);
        }
      }
    }

    const currentPage = this.state.currentPage;
    this.updateSceneKeys({
      page: pageNumber,
      callback: () => this.onChangeTab(currentPage, pageNumber),
    });
  };

  renderTabBar(props) {
    const { renderTabBar } = this.props;

    if (renderTabBar === false) {
      return null;
    } else if (renderTabBar) {
      return React.cloneElement(renderTabBar(props), props);
    } else {
      return <DefaultTabBar {...props} />;
    }
  }

  updateSceneKeys({
    page,
    children = this.props.children,
    callback = () => {},
  }) {
    const newKeys = this.newSceneKeys({
      previousKeys: this.state.sceneKeys,
      currentPage: page,
      children,
    });
    this.setState({ currentPage: page, sceneKeys: newKeys }, callback);
  }

  newSceneKeys({
    previousKeys = [],
    currentPage = 0,
    children = this.props.children,
  }) {
    const newKeys = [];
    this._children(children).forEach((child, idx) => {
      const key = this._makeSceneKey(child, idx);
      if (
        this._keyExists(previousKeys, key) ||
        this._shouldRenderSceneKey(idx, currentPage)
      ) {
        newKeys.push(key);
      }
    });
    return newKeys;
  }

  _shouldRenderSceneKey(idx, currentPageKey) {
    const numOfSibling = this.props.prerenderingSiblingsNumber;
    return (
      idx < currentPageKey + numOfSibling + 1 &&
      idx > currentPageKey - numOfSibling - 1
    );
  }

  _keyExists(sceneKeys, key) {
    return sceneKeys.find(sceneKey => key === sceneKey);
  }

  _makeSceneKey(child, idx) {
    return child.props.tabLabel + '_' + idx;
  }

  renderIOS() {
    const { initialPage } = this.props; // is this really accurate?
    const { containerWidth } = this.state;

    return (
      <Animated.ScrollView
        horizontal
        pagingEnabled
        automaticallyAdjustContentInsets={false}
        contentOffset={{
          x: initialPage * containerWidth,
        }}
        ref={scrollView => {
          this.scrollView = scrollView;
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: this.state.scrollXIOS } } }],
          { useNativeDriver: true, listener: this._onScroll },
        )}
        onMomentumScrollBegin={this._onMomentumScrollBeginAndEnd}
        onMomentumScrollEnd={this._onMomentumScrollBeginAndEnd}
        scrollEventThrottle={16}
        scrollsToTop={false}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!this.props.locked}
        directionalLockEnabled
        alwaysBounceVertical={false}
        keyboardDismissMode="on-drag"
        {...this.props.contentProps}
      >
        {this.composeScenes()}
      </Animated.ScrollView>
    ); // todo look up flow types for contentprops
  }

  renderAndroid() {
    return (
      <AnimatedViewPagerAndroid
        key={this._children().length}
        style={styles.scrollableContentAndroid}
        initialPage={this.props.initialPage}
        onPageSelected={this._updateSelectedPage}
        keyboardDismissMode="on-drag"
        scrollEnabled={!this.props.locked}
        onPageScroll={Animated.event(
          [
            {
              nativeEvent: {
                position: this.state.positionAndroid,
                offset: this.state.offsetAndroid,
              },
            },
          ],
          {
            useNativeDriver: true,
            listener: this._onScroll,
          },
        )}
        ref={ref => {
          this.scrollView = ref;
        }}
        {...this.props.contentProps}
      >
        {this.composeScenes()}
      </AnimatedViewPagerAndroid>
    );
  }

  renderScrollableContent() {
    if (Platform.OS === 'ios') {
      return this.renderIOS();
    } else {
      return this.renderAndroid();
    }
  }

  composeScenes() {
    return this._children().map((child, idx) => {
      let key = this._makeSceneKey(child, idx);
      return (
        <SceneComponent
          key={child.key}
          shouldUpdated={this._shouldRenderSceneKey(
            idx,
            this.state.currentPage,
          )}
          style={{ width: this.state.containerWidth }}
        >
          {this._keyExists(this.state.sceneKeys, key) ? (
            child
          ) : (
            <View tabLabel={child.props.tabLabel} />
          )}
        </SceneComponent>
      );
    });
  }

  _onMomentumScrollBeginAndEnd(e) {
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / this.state.containerWidth);
    if (this.state.currentPage !== page) {
      this._updateSelectedPage(page);
    }
  }

  _updateSelectedPage(nextPage) {
    let localNextPage = nextPage;
    if (typeof localNextPage === 'object') {
      // TODO what is this actually
      localNextPage = nextPage.nativeEvent.position;
    }

    const currentPage = this.state.currentPage;
    this.updateSceneKeys({
      page: localNextPage,
      callback: () => this.onChangeTab(currentPage, localNextPage),
    });
  }

  onChangeTab = (prevPage, currentPage) => {
    this.props.onChangeTab({
      i: currentPage,
      ref: this._children()[currentPage],
      from: prevPage,
    });
  };

  _onScroll(e) {
    if (Platform.OS === 'ios') {
      const offsetX = e.nativeEvent.contentOffset.x;
      if (offsetX === 0 && !this.scrollOnMountCalled) {
        this.scrollOnMountCalled = true;
      } else {
        this.props.onScroll(offsetX / this.state.containerWidth);
      }
    } else {
      const { position, offset } = e.nativeEvent;
      this.props.onScroll(position + offset);
    }
  }

  onContainerLayout = e => {
    const { width } = e.nativeEvent.layout;
    const { containerWidth, scrollXIOS, currentPage } = this.state;

    if (
      !width ||
      width <= 0 ||
      Math.round(width) === Math.round(containerWidth)
    ) {
      return;
    }

    if (Platform.OS === 'ios') {
      const containerWidthAnimatedValue = new Animated.Value(width);
      const scrollValue = Animated.divide(
        scrollXIOS,
        containerWidthAnimatedValue,
      );

      this.setState({ containerWidth: width, scrollValue });
    } else {
      this.setState({ containerWidth: width });
    }

    requestAnimationFrame(() => {
      this.goToPage(currentPage);
    });
  };

  _children(children = this.props.children) {
    return React.Children.map(children, child => child);
  }

  render() {
    const {
      initialPage,
      tabBarPosition,
      tabBarBackgroundColor,
      tabBarActiveTextColor,
    } = this.props;
    const { currentPage, scrollValue, containerWidth } = this.state;

    const isTabBarPositionOverlay =
      tabBarPosition === 'overlayTop' || tabBarPosition === 'overlayBottom';

    const tabBarProps = {
      goToPage: this.goToPage,
      tabs: this._children().map(child => child.props.tabLabel),
      activeTab: currentPage ? currentPage : initialPage,
      scrollValue,
      containerWidth,
      backgroundColor: tabBarBackgroundColor,
      activeTextColor: tabBarActiveTextColor,
      inactiveTextColor: tabBarInactiveTextColor,
      textStyle: tabBarTextStyle,
      underlineStyle: tabBarUnderlineStyle,
      style: isTabBarPositionOverlay
        ? {
            position: 'absolute',
            left: 0,
            right: 0,
            [tabBarPosition === 'overlayTop' ? 'top' : 'bottom']: 0,
          }
        : undefined,
    };

    return (
      <View
        style={[styles.container, this.props.style]}
        onLayout={this.onContainerLayout}
      >
        {tabBarPosition === 'top' && this.renderTabBar(tabBarProps)}
        {this.renderScrollableContent()}
        {(tabBarPosition === 'bottom' || isTabBarPositionOverlay) &&
          this.renderTabBar(tabBarProps)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollableContentAndroid: {
    flex: 1,
  },
});

export default ScrollableTabView;
