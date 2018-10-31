// @flow
import * as React from 'react';
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

import type AnimatedValue from 'react-native/Libraries/Animated/src/nodes/AnimatedValue';

type ViewProps = React.ElementProps<typeof View>;
type ViewStyleProp = $PropertyType<ViewProps, 'style'>;

type TabBarPosition = 'top' | 'bottom' | 'overlayTop' | 'overlayBottom';

type RefObject = {|
  current: any,
|};

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

type State = {
  currentPage: number,
  containerWidth: number,
  offsetAndroid: AnimatedValue,
  positionAndroid: AnimatedValue,
  sceneKeys: Array<string>,
  scrollXIOS: AnimatedValue,
  scrollValue: AnimatedDivision,
};

class ScrollableTabView extends React.Component<Props, State> {
  scrollView: RefObject;
  viewPageAndroid: RefObject;
  scrollOnMountCalled: boolean;

  constructor(props: Props) {
    super(props);

    const { initialPage } = props;

    this.scrollView = React.createRef();
    this.viewPageAndroid = React.createRef();
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

  componentDidUpdate(prevProps: Props) {
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

  goToPage = (pageNumber: number) => {
    const { scrollWithoutAnimation } = this.props;
    const { containerWidth } = this.state;

    if (Platform.OS === 'ios') {
      const offset = pageNumber * containerWidth;
      if (this.scrollView) {
        this.scrollView.getNode().scrollTo({
          x: offset,
          y: 0,
          animated: !scrollWithoutAnimation,
        });
      }
    } else {
      if (this.viewPageAndroid) {
        if (scrollWithoutAnimation) {
          this.viewPageAndroid.getNode().setPageWithoutAnimation(pageNumber);
        } else {
          this.viewPageAndroid.getNode().setPage(pageNumber);
        }
      }
    }

    const currentPage = this.state.currentPage;
    this.updateSceneKeys({
      page: pageNumber,
      callback: () => this.onChangeTab(currentPage, pageNumber),
    });
  };

  renderTabBar(props: Props) {
    // TODO this should be a TarBarProps which is exported
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
      const key = this.makeSceneKey(child, idx);
      if (
        this.keyExists(previousKeys, key) ||
        this.shouldRenderSceneKey(idx, currentPage)
      ) {
        newKeys.push(key);
      }
    });
    return newKeys;
  }

  shouldRenderSceneKey(index: number, currentPageKey: number) {
    const numOfSibling = this.props.prerenderingSiblingsNumber;
    return (
      index < currentPageKey + numOfSibling + 1 &&
      index > currentPageKey - numOfSibling - 1
    );
  }

  keyExists(sceneKeys: Array<string>, key: string) {
    return sceneKeys.find(sceneKey => key === sceneKey);
  }

  makeSceneKey(child: React.Node, idx: string) {
    return child.props.tabLabel + '_' + idx;
  }

  renderIOS(): any {
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
        ref={this.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: this.state.scrollXIOS } } }],
          { useNativeDriver: true, listener: this.onScroll },
        )}
        onMomentumScrollBegin={this.onMomentumScrollBeginAndEnd}
        onMomentumScrollEnd={this.onMomentumScrollBeginAndEnd}
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
    );
  }

  renderAndroid(): any {
    return (
      <AnimatedViewPagerAndroid
        key={this._children().length}
        style={styles.scrollableContentAndroid}
        initialPage={this.props.initialPage}
        onPageSelected={this.onPageSelected}
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
            listener: this.onScroll,
          },
        )}
        ref={this.viewPageAndroid}
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
      let key = this.makeSceneKey(child, idx);
      return (
        <SceneComponent
          key={child.key}
          shouldUpdated={this.shouldRenderSceneKey(idx, this.state.currentPage)}
          style={{ width: this.state.containerWidth }}
        >
          {this.keyExists(this.state.sceneKeys, key) ? (
            child
          ) : (
            <View tabLabel={child.props.tabLabel} />
          )}
        </SceneComponent>
      );
    });
  }

  onMomentumScrollBeginAndEnd = (e: Object) => {
    const { currentPage, containerWidth } = this.state;
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / containerWidth);

    if (currentPage !== page) {
      this.updateSelectedPage(page);
    }
  };

  onPageSelected = (e: Object) => {
    const page = e.nativeEvent.position;
    this.updateSelectedPage(page);
  };

  updateSelectedPage = (nextPage: number) => {
    const { currentPage } = this.state;

    this.updateSceneKeys({
      page: nextPage,
      callback: () => this.onChangeTab(currentPage, nextPage),
    });
  };

  onChangeTab = (prevPage: number, currentPage: number) => {
    this.props.onChangeTab({
      i: currentPage,
      ref: this._children()[currentPage],
      from: prevPage,
    });
  };

  onScroll = (e: Object) => {
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
  };

  onContainerLayout = (e: Object) => {
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
      tabBarTextStyle,
      tabBarUnderlineStyle,
      tabBarInactiveTextColor,
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
