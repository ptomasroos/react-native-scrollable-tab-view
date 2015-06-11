'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  PanResponder,
} = React;

var deviceWidth = require('Dimensions').get('window').width;
var rebound = require('rebound');
var precomputeStyle = require('precomputeStyle');

var ScrollableTabView = React.createClass({
  componentDidMount() {
    this._scrollSpring.setCurrentValue(0);
  },

  componentWillMount() {
    this.currentPage = 0;

    // Initialize the spring that will drive animations
    this.springSystem = new rebound.SpringSystem();
    this._scrollSpring = this.springSystem.createSpring();
    var springConfig = this._scrollSpring.getSpringConfig();
    springConfig.tension = rebound.OrigamiValueConverter.tensionFromOrigamiValue(25);
    springConfig.friction = rebound.OrigamiValueConverter.frictionFromOrigamiValue(8);
    this._scrollSpring.setOvershootClampingEnabled(false);

    this._scrollSpring.addListener({
      onSpringUpdate: () => {
        if (!this.scrollView || !this.tabUnderline) { return }

        var numberOfTabs = this.props.children.length;
        var currentValue = this._scrollSpring.getCurrentValue();
        var offsetX = deviceWidth * currentValue;

        this.scrollView.setNativeProps(precomputeStyle({
          transform: [{translateX: -1 * offsetX}],
        }));

        this.tabUnderline.setNativeProps(precomputeStyle({
          left: offsetX / numberOfTabs
        }));
      },
    });

    this._panResponder = PanResponder.create({
      // Claim responder if it's a horizontal pan
      onMoveShouldSetPanResponder: (e, gestureState) => {
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          return true;
        }
      },

      // Touch is released, scroll to the one that you're closest to
      onPanResponderRelease: (e, gestureState) => {
        var relativeGestureDistance = gestureState.dx / deviceWidth,
            lastPageIndex = this.props.children.length - 1,
            vx = gestureState.vx;

        if (this.currentPage != lastPageIndex && (relativeGestureDistance < -0.5 || (relativeGestureDistance < 0 && vx <= 0.5))) {
          this.currentPage = this.currentPage + 1;
        } else if (this.currentPage != 0 && (relativeGestureDistance > 0.5 || (relativeGestureDistance > 0 && vx >= 0.5))) {
          this.currentPage = this.currentPage - 1;
        }

        this._scrollSpring.setEndValue(this.currentPage);
      },

      // Dragging, move the view with the touch
      onPanResponderMove: (e, gestureState) => {
        var dx = gestureState.dx;
        var lastPageIndex = this.props.children.length - 1;

        if (this.currentPage == 0 && dx > 0) {
          // Don't set the spring if we're on the first page and trying to move before it
        } else if (this.currentPage == lastPageIndex && dx < 0) {
          // Don't set the spring if we're already on the last page and trying to move to the next
        } else {
          // This is awkward because when we are scrolling we are offsetting the underlying view
          // to the left (-x)
          var offsetX = dx - (this.currentPage * deviceWidth);
          this._scrollSpring.setCurrentValue(-1 * offsetX / deviceWidth);
        }
      },
    });
  },

  goToPage(pageNumber) {
    this._scrollSpring.setEndValue(pageNumber);
    this.props.onChangeTab &&
      this.props.onChangeTab({i: pageNumber, ref: this.props.children[pageNumber]});
  },

  renderTabOption(name, page) {
    return (
      <TouchableOpacity key={name} onPress={() => this.goToPage(page)}>
         <View style={styles.tab}>
          <Text>{name}</Text>
         </View>
      </TouchableOpacity>
    );
  },

  render() {
    var numberOfTabs = this.props.children.length;
    var tabUnderlineOptions = this.props.tabUnderlineOptions || {};
    var tabUnderlineStyle = {
      position: 'absolute',
      width: deviceWidth / numberOfTabs,
      height: tabUnderlineOptions.height || 4,
      backgroundColor: tabUnderlineOptions || 'navy',
      bottom: 0,
    }

    var sceneContainerStyle = {
      width: deviceWidth * this.props.children.length,
      flex: 1,
      flexDirection: 'row'
    }

    return (
      <View style={{flex: 1}}>
        <View style={styles.tabs}>
          {this.props.children.map((child, i) => this.renderTabOption(child.props.tabLabel, i))}
          <View style={tabUnderlineStyle}
                ref={view => { this.tabUnderline = view; }} />
        </View>

        <View style={sceneContainerStyle} {...this._panResponder.panHandlers}
              ref={view => { this.scrollView = view; }}>
          {this.props.children}
        </View>
      </View>
    )
  }
});

var styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },

  tabs: {
    height: 50,
    flexDirection: 'row',
    marginTop: 20,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomColor: '#ccc',
  },
});

module.exports = ScrollableTabView;
