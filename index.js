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
  Platform,
  StyleSheet,
  ViewPagerAndroid,
  InteractionManager,
} = ReactNative;
const TimerMixin = require('react-timer-mixin');

const StaticContainer = require('react-static-container');
const DefaultTabBar = require('./DefaultTabBar');
const ScrollableTabBar = require('./ScrollableTabBar');


class SceneComponent extends Component{
  render(){
    let {selected, ...props} = this.props
    return(
      <View {...props}>
        <StaticContainer shouldUpdate={selected}>
          {this.props.children}
        </StaticContainer>
      </View>
    )
  }
}

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
    };
  },

  getInitialState() {
    return {
      currentPage: this.props.initialPage,
      scrollValue: new Animated.Value(this.props.initialPage),
      containerWidth: Dimensions.get('window').width,
      sceneKeys:this.updateSceneKeys(this.props.children,[],this.props.initialPage),
    };
  },

  componentWillReceiveProps(props) {
    if (props.page >= 0 && props.page !== this.state.currentPage) {
      this.goToPage(props.page);
    }
  },

  goToPage(pageNumber) {
    this.props.onChangeTab({ i: pageNumber, ref: this._children()[pageNumber], });

    if (Platform.OS === 'ios') {
      const offset = pageNumber * this.state.containerWidth;
      if (this.scrollView) {
        this.scrollView.scrollTo({x: offset, y: 0, animated: !this.props.scrollWithoutAnimation, });
      }
    } else {
      if (this.scrollView) {
        if (this.props.scrollWithoutAnimation) {
          this.scrollView.setPageWithoutAnimation(pageNumber);
        } else {
          this.scrollView.setPage(pageNumber);
        }
      }
    }

    if(this.props.children.length !== this.state.sceneKeys.length){
      let newKeys = this.updateSceneKeys(this.props.children,this.state.sceneKeys,pageNumber)
      this.setState({currentPage: pageNumber,sceneKeys:newKeys });
    }else{
      this.setState({currentPage: pageNumber, });
    }
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

  updateSceneKeys(children,sceneKeys=[],currentPage){
    let newKeys=[]
    children.forEach((child,idx) => {
      let key=this._makeSceneKey(child,idx)
      if(this._keyExists(sceneKeys,key) || currentPage == idx) newKeys.push(key)
    })
    return newKeys;
  },

  _keyExists(sceneKeys,key){
    return sceneKeys.findIndex((sceneKey)=> key == sceneKey) > -1
  },

  _makeSceneKey(child,idx){
    return child.props.tabLabel + '_' + idx
  },

  renderScrollableContent() {
    if (Platform.OS === 'ios') {
      let scenes=[]
      this._children().forEach((child, idx) => {
        let key=this._makeSceneKey(child,idx)
        let selected=false;

        // if key doesnt exist(typically before each tab is first mounted) then put a dummy child instead of real
        // this ensures # of pages remain the same , leaving scrolling and click tab effect to be handled as intended
        if(!this._keyExists(this.state.sceneKeys,key)){ 
          let scene=(
            <SceneComponent
            key={key}
            style={{width: this.state.containerWidth, }}
            selected={selected}>
              <View tabLabel={child.props.tabLabel}/>
            </SceneComponent>
          )
          scenes.push(scene)
        }
        // if keyexists and the tab is viewed for the first time then SceneComponent is mounted, else its updated and rendered 
        // Also when a tab is selected,StaticContainer inside the SceneComponent makes sure that only tab being viewed is rendered
        if(this._keyExists(this.state.sceneKeys,key)){
          if(idx==this.state.currentPage) selected=true
          let scene=(
            <SceneComponent
            key={key}
            style={{width: this.state.containerWidth, }}
            selected={selected}>
              {child}
            </SceneComponent>
          )
          scenes.push(scene)
        }
      })
      return (
        <ScrollView
          horizontal
          pagingEnabled
          automaticallyAdjustContentInsets={false}
          style={styles.scrollableContentIOS}
          contentContainerStyle={styles.scrollableContentContainerIOS}
          contentOffset={{ x: this.props.initialPage * this.state.containerWidth, }}
          ref={(scrollView) => { this.scrollView = scrollView; }}
          onScroll={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            this._updateScrollValue(offsetX / this.state.containerWidth);
          }}
          onMomentumScrollBegin={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const page = Math.round(offsetX / this.state.containerWidth);
            if (this.state.currentPage !== page) {
              this._updateSelectedPage(page);
            }
          }}
          onMomentumScrollEnd={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const page = Math.round(offsetX / this.state.containerWidth);
            if (this.state.currentPage !== page) {
              this._updateSelectedPage(page);
            }
          }}
          scrollEventThrottle={16}
          scrollsToTop={false}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!this.props.locked}
          directionalLockEnabled
          alwaysBounceVertical={false}
          keyboardDismissMode="on-drag"
          {...this.props.contentProps}>
            {scenes}
        </ScrollView>
      );
    } else {
      let scenes=[]
      this._children().forEach((child, idx) => {
        let key=this._makeSceneKey(child,idx)
        let selected=false;

        // if key doesnt exist(typically before each tab is first mounted) then put a dummy child instead of real
        // this ensures # of pages remain the same , leaving scrolling and click tab effect to be handled as intended
        if(!this._keyExists(this.state.sceneKeys,key)){ 
          let scene=(
            <SceneComponent
            key={key}
            style={{width: this.state.containerWidth, }}
            selected={selected}>
              <View tabLabel={child.props.tabLabel}/>
            </SceneComponent>
          )
          scenes.push(scene)
        }
        // if keyexists and the tab is viewed for the first time then SceneComponent is mounted, else its updated and rendered 
        // Also when a tab is selected,StaticContainer inside the SceneComponent makes sure that only tab being viewed is rendered
        if(this._keyExists(this.state.sceneKeys,key)){
          if(idx==this.state.currentPage) selected=true
          let scene=(
            <SceneComponent
            key={key}
            style={{width: this.state.containerWidth, }}
            selected={selected}>
              {child}
            </SceneComponent>
          )
          scenes.push(scene)
        }
      })
      return (
        <ViewPagerAndroid
         style={styles.scrollableContentAndroid}
         initialPage={this.props.initialPage}
         onPageSelected={this._updateSelectedPage}
         keyboardDismissMode="on-drag"
         scrollEnabled={!this.props.locked}
         onPageScroll={(e) => {
           const { offset, position, } = e.nativeEvent;
           this._updateScrollValue(position + offset);
         }}
         ref={(scrollView) => { this.scrollView = scrollView; }}
         {...this.props.contentProps}>
           {scenes}
        </ViewPagerAndroid>
      );
    }
  },

  _updateSelectedPage(currentPage) {
    let localCurrentPage = currentPage;
    if (typeof localCurrentPage === 'object') {
      localCurrentPage = currentPage.nativeEvent.position;
    }
    // scenekeys length and children length is same then no need to update the keys as all are stored by now
    if(this.props.children.length !== this.state.sceneKeys.length){
      let newKeys = this.updateSceneKeys(this.props.children,this.state.sceneKeys,localCurrentPage)
      this.setState({currentPage:localCurrentPage,sceneKeys:newKeys }, () => {
        this.props.onChangeTab({ i: localCurrentPage, ref: this._children()[localCurrentPage], });
      })
    }else{
      this.setState({currentPage: localCurrentPage, }, () => {
        this.props.onChangeTab({ i: localCurrentPage, ref: this._children()[localCurrentPage], });
      });
    }
  },

  _updateScrollValue(value) {
    this.state.scrollValue.setValue(value);
    this.props.onScroll(value);
  },

  _handleLayout(e) {
    const { width, } = e.nativeEvent.layout;

    if (width !== this.state.containerWidth) {
      this.setState({ containerWidth: width, });
      this.requestAnimationFrame(() => {
        this.goToPage(this.state.currentPage);
      });
    }
  },

  _children() {
    return React.Children.map(this.props.children, (child) => child);
  },

  render() {
    let overlayTabs = (this.props.tabBarPosition === 'overlayTop' || this.props.tabBarPosition === 'overlayBottom');
    let tabBarProps = {
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
    if (this.props.tabBarTextStyle) {
      tabBarProps.textStyle = this.props.tabBarTextStyle;
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
