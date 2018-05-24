import React, {Component} from 'react';

const PropTypes = require('prop-types');
import {
  Dimensions,
  View,
  Animated,
  ScrollView,
  StyleSheet,
  InteractionManager,
  Platform,
  Keyboard
} from 'react-native';
const TimerMixin = require('react-timer-mixin');

const SceneComponent = require('./SceneComponent');
const DefaultTabBar = require('./DefaultTabBar');
const ScrollableTabBar = require('./ScrollableTabBar');

class ScrollableTabView extends Component{
  // mixins: [TimerMixin, ],
  // statics: {
  //   DefaultTabBar,
  //   ScrollableTabBar,
  // }

  

  constructor(props){
    super(props)
    this.state= {
      currentPage: props.initialPage,
      scrollX: new Animated.Value(props.initialPage * Dimensions.get('window').width),
      scrollValue: new Animated.Value(props.initialPage),
      containerWidth: Dimensions.get('window').width,
      sceneKeys: this.newSceneKeys({ currentPage: props.initialPage, }),
    }
  }
  

  componentDidMount() {
     setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        if (Platform.OS === 'android') {
          this.goToPage(this.props.initialPage, false);
        }
      });
    }, 0);

    this.state.scrollX.addListener(({ value, }) => {
      const scrollValue = value / this.state.containerWidth;
      this.state.scrollValue.setValue(scrollValue);
      Keyboard.dismiss();
      this.props.onScroll(scrollValue);
    });
  }
  componentWillReceiveProps(props) {
    if (props.children !== this.props.children) {
      this.updateSceneKeys({ page: this.state.currentPage, children: props.children, });
    }

    if (props.page >= 0 && props.page !== this.state.currentPage) {
      this.goToPage(props.page);
    }
  }

  goToPage=(pageNumber, animated = !this.props.scrollWithoutAnimation) =>{
    const offset = pageNumber * this.state.containerWidth;
    if (this.scrollView && this.scrollView._component && this.scrollView._component.scrollTo) {
      this.scrollView._component.scrollTo({x: offset, y: 0, animated, });
    }

    const currentPage = this.state.currentPage;
    this.updateSceneKeys({
      page: pageNumber,
      callback: this._onChangeTab.bind(this, currentPage, pageNumber),
    });
  }

  renderTabBar=(props) =>{
    if (this.props.renderTabBar === false) {
      return null;
    } else if (this.props.renderTabBar) {
      return React.cloneElement(this.props.renderTabBar(props), props);
    } else {
      return <DefaultTabBar {...props} />;
    }
  }

  updateSceneKeys=({ page, children = this.props.children, callback = () => {}, }) =>{
    let newKeys = this.newSceneKeys({ previousKeys: this.state.sceneKeys, currentPage: page, children, });
    this.setState({currentPage: page, sceneKeys: newKeys, }, callback);
  }

  newSceneKeys=({ previousKeys = [], currentPage = 0, children = this.props.children, }) =>{
    let newKeys = [];
    this._children(children).forEach((child, idx) => {
      let key = this._makeSceneKey(child, idx);
      if (this._keyExists(previousKeys, key) ||
        this._shouldRenderSceneKey(idx, currentPage)) {
        newKeys.push(key);
      }
    });
    return newKeys;
  }

  _shouldRenderSceneKey=(idx, currentPageKey)=> {
    let numOfSibling = this.props.prerenderingSiblingsNumber;
    return (idx < (currentPageKey + numOfSibling + 1) &&
      idx > (currentPageKey - numOfSibling - 1));
  }

  _keyExists=(sceneKeys, key) =>{
    return sceneKeys.find((sceneKey) => key === sceneKey);
  }

  _makeSceneKey=(child, idx) =>{
    return child.props.tabLabel + '_' + idx;
  }

  renderScrollableContent=()=> {
    const scenes = this._composeScenes();
    return <Animated.ScrollView
      horizontal
      pagingEnabled
      automaticallyAdjustContentInsets={false}
      contentOffset={{ x: this.props.initialPage * this.state.containerWidth, }}
      ref={(scrollView) => { this.scrollView = scrollView; }}
      onScroll={
        Animated.event([{
          nativeEvent: { contentOffset: { x: this.state.scrollX, }, },
        }, ], {
          useNativeDriver: true,
        })
      }
      onMomentumScrollBegin={this._onMomentumScrollBeginAndEnd}
      onMomentumScrollEnd={this._onMomentumScrollBeginAndEnd}
      scrollEventThrottle={16}
      scrollsToTop={false}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={!this.props.locked}
      directionalLockEnabled
      alwaysBounceVertical={false}
      keyboardDismissMode="on-drag"

      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => true}
      onResponderGrant={this.props.onScrollBeginDrag}
      onResponderRelease={this.props.onScrollEndDrag}
      onPanResponderTerminate={this.props.onScrollEndDrag}


      {...this.props.contentProps}
      >
      {scenes}
    </Animated.ScrollView>;
  }

  _composeScenes=() =>{
    return this._children().map((child, idx) => {
      let key = this._makeSceneKey(child, idx);
      return <SceneComponent
        key={child.key}
        shouldUpdated={this._shouldRenderSceneKey(idx, this.state.currentPage)}
        style={{width: this.state.containerWidth, }}
      >
        {this._keyExists(this.state.sceneKeys, key) ? child : <View tabLabel={child.props.tabLabel}/>}
      </SceneComponent>;
    });
  }

  _onMomentumScrollBeginAndEnd=(e) =>{
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / this.state.containerWidth);
    if (this.state.currentPage !== page) {
      this._updateSelectedPage(page);
    }
  }

  _updateSelectedPage=(nextPage)=> {
    let localNextPage = nextPage;
    if (typeof localNextPage === 'object') {
      localNextPage = nextPage.nativeEvent.position;
    }

    const currentPage = this.state.currentPage;
    this.updateSceneKeys({
      page: localNextPage,
      callback: this._onChangeTab.bind(this, currentPage, localNextPage),
    });
  }

  _onChangeTab=(prevPage, currentPage)=> {
    this.props.onChangeTab({
      i: currentPage,
      ref: this._children()[currentPage],
      from: prevPage,
    });
  }

  _handleLayout=(e) =>{
    const { width, } = e.nativeEvent.layout;

    if (Math.round(width) !== Math.round(this.state.containerWidth)) {
      this.setState({ containerWidth: width, });
      this.requestAnimationFrame(() => {
        this.goToPage(this.state.currentPage);
      });
    }
  }

  _children=(children = this.props.children) =>{
    return React.Children.map(children, (child) => child);
  }

  render() {
    let overlayTabs = (this.props.tabBarPosition === 'overlayTop' || this.props.tabBarPosition === 'overlayBottom');
    let tabBarProps = {
      goToPage: this.goToPage,
      tabs: this._children().map((child) => child.props.tabLabel),
      activeTab: this.state.currentPage,
      scrollX: this.state.scrollX,
      scrollValue: this.state.scrollValue,
      containerWidth: this.state.containerWidth,
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
  }
};
ScrollableTabView.propTypes={
  tabBarPosition: PropTypes.oneOf(['top', 'bottom', 'overlayTop', 'overlayBottom', ]),
  initialPage: PropTypes.number,
  page: PropTypes.number,
  onChangeTab: PropTypes.func,
  onScroll: PropTypes.func,
  renderTabBar: PropTypes.any,
  style: PropTypes.object,
  contentProps: PropTypes.object,
  scrollWithoutAnimation: PropTypes.bool,
  locked: PropTypes.bool,
  prerenderingSiblingsNumber: PropTypes.number,
  onScrollBeginDrag: PropTypes.func,
  onScrollEndDrag: PropTypes.func
}

ScrollableTabView.defaultProps = {
  tabBarPosition: 'top',
  initialPage: 0,
  page: -1,
  onChangeTab: () => {},
  onScroll: () => {},
  contentProps: {},
  scrollWithoutAnimation: false,
  locked: false,
  prerenderingSiblingsNumber: 0,
  onScrollBeginDrag: () => null,
  onScrollEndDrag: () => null,
};
module.exports = ScrollableTabView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollableContentAndroid: {
    flex: 1,
  },
});
