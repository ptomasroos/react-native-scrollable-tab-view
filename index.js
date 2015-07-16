'use strict';

var React = require('react-native');
var {
  Dimensions,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  PanResponder,
} = React;

var DefaultTabBar = require('./DefaultTabBar');
var deviceWidth = Dimensions.get('window').width;
var rebound = require('rebound');
var precomputeStyle = require('precomputeStyle');
var TAB_BAR_REF = 'TAB_BAR';

var ScrollableTabView = React.createClass({
  getDefaultProps() {
    return {
      edgeHitWidth: 30,
    }
  },

  getInitialState() {
    return { currentPage: 0 };
  },

  componentDidMount() {
    this._scrollSpring.setCurrentValue(0);
  },

  componentWillMount() {
    // Initialize the spring that will drive animations
    this.springSystem = new rebound.SpringSystem();
    this._scrollSpring = this.springSystem.createSpring();
    this._updateSpringConfig(this.props);

    this._scrollSpring.addListener({
      onSpringUpdate: () => {
        if (!this.scrollView) { return; }

        var currentValue = this._scrollSpring.getCurrentValue();
        var offsetX = deviceWidth * currentValue;

        this.scrollView.setNativeProps(precomputeStyle({
          transform: [{translateX: -1 * offsetX}],
        }));

        // Pass the currentValue on to the tabBar component
        this.refs[TAB_BAR_REF].setAnimationValue(currentValue);
      },
    });

    this._panResponder = PanResponder.create({
      // Claim responder if it's a horizontal pan
      onMoveShouldSetPanResponder: (e, gestureState) => {
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          if ((gestureState.moveX <= this.props.edgeHitWidth ||
              gestureState.moveX >= deviceWidth - this.props.edgeHitWidth) && 
                this.props.scrollEnabled !== false) {
            return true;
          }
        }
      },

      // Touch is released, scroll to the one that you're closest to
      onPanResponderRelease: (e, gestureState) => {
        var relativeGestureDistance = gestureState.dx / deviceWidth,
            lastPageIndex = this.props.children.length - 1,
            vx = gestureState.vx,
            newPage = this.state.currentPage;

        if (this.state.currentPage !== lastPageIndex && (relativeGestureDistance < -0.5 || (relativeGestureDistance < 0 && vx <= 0.5))) {
          newPage = newPage + 1;
        } else if (this.state.currentPage !== 0 && (relativeGestureDistance > 0.5 || (relativeGestureDistance > 0 && vx >= 0.5))) {
          newPage = newPage - 1;
        }

        this.goToPage(newPage);
      },

      // Dragging, move the view with the touch
      onPanResponderMove: (e, gestureState) => {
        var dx = gestureState.dx;
        var lastPageIndex = this.props.children.length - 1;

        if (this.state.currentPage === 0 && dx > 0) {
          // Don't set the spring if we're on the first page and trying to move before it
        } else if (this.state.currentPage === lastPageIndex && dx < 0) {
          // Don't set the spring if we're already on the last page and trying to move to the next
        } else {
          // This is awkward because when we are scrolling we are offsetting the underlying view
          // to the left (-x)
          var offsetX = dx - (this.state.currentPage * deviceWidth);
          this._scrollSpring.setCurrentValue(-1 * offsetX / deviceWidth);
        }
      },
    });
  },

  componentWillReceiveProps(nextProps) {
    this._updateSpringConfig(nextProps);
  },

  _updateSpringConfig(props) {
    var springConfig = this._scrollSpring.getSpringConfig();
    springConfig.tension = rebound.OrigamiValueConverter.tensionFromOrigamiValue(props.springTension || 25);
    springConfig.friction = rebound.OrigamiValueConverter.frictionFromOrigamiValue(props.springFriction || 8);

    this._scrollSpring.setOvershootClampingEnabled((typeof props.clampSpring === 'undefined') ? true : props.clampSpring);
  },

  goToPage(pageNumber) {
    this.props.currentPage !== pageNumber && this.props.onChangeTab &&
      this.props.onChangeTab({i: pageNumber, ref: this.props.children[pageNumber]});

    this._scrollSpring.setEndValue(pageNumber);
    this.setState({currentPage: pageNumber});
  },

  renderTabBar(props) {
    if (this.props.renderTabBar) {
      return React.cloneElement(this.props.renderTabBar(), props);
    } else {
      return <DefaultTabBar {...props} />;
    }
  },

  render() {
    var sceneContainerStyle = {
      width: deviceWidth * this.props.children.length,
      flex: 1,
      flexDirection: 'row'
    };

    return (
      <View style={{flex: 1}}>
        {this.renderTabBar({goToPage: this.goToPage,
                            tabs: this.props.children.map((child) => child.props.tabLabel),
                            activeTab: this.state.currentPage,
                            ref: TAB_BAR_REF})}

        <View style={sceneContainerStyle} {...this._panResponder.panHandlers}
              ref={view => { this.scrollView = view; }}>
          {this.props.children}
        </View>
      </View>
    );
  }
});

module.exports = ScrollableTabView;
