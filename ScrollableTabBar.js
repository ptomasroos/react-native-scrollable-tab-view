const React = require('react');
const ReactNative = require('react-native');
const {
  View,
  Animated,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Platform,
  findNodeHandle,
  Dimensions,
} = ReactNative;

const TAB_HEIGHT = 50;
const WINDOW_WIDTH = Dimensions.get('window').width;

const ScrollableTabBar = React.createClass({
  propTypes: {
    goToPage: React.PropTypes.func,
    activeTab: React.PropTypes.number,
    tabs: React.PropTypes.array,
    underlineColor: React.PropTypes.string,
    underlineHeight: React.PropTypes.number,
    backgroundColor: React.PropTypes.string,
    activeTextColor: React.PropTypes.string,
    inactiveTextColor: React.PropTypes.string,
    scrollOffset: React.PropTypes.number,
    style: React.PropTypes.object,
    tabStyle: React.PropTypes.object,
    tabsContainerStyle: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      scrollOffset: 52,
      activeTextColor: 'navy',
      inactiveTextColor: 'black',
      underlineColor: 'navy',
      backgroundColor: null,
      underlineHeight: 4,
      style: {},
      tabStyle: {},
      tabsContainerStyle: {},
    };
  },

  getInitialState() {
    this._tabsMeasurements = [];
    return {
      _leftTabUnderline: new Animated.Value(0),
      _widthTabUnderline: new Animated.Value(0),
      _containerWidth: null,
    };
  },

  componentDidMount() {
    this.props.scrollValue.addListener(this.updateView);
  },

  updateView(offset) {
    const position = Math.floor(offset.value);
    const pageOffset = offset.value % 1;
    const tabCount = this.props.tabs.length;

    if (tabCount === 0 || offset.value < 0 || offset.value > tabCount - 1) {
      return;
    }

    if (this.necessarilyMeasurementsCompleted(position)) {
      this.updateTabPanel(position, pageOffset);
      this.updateTabUnderline(position, pageOffset, tabCount);
    }
  },

  necessarilyMeasurementsCompleted(position) {
    return this._tabsMeasurements[position] && this._tabsMeasurements[position + 1];
  },

  updateTabPanel(position, pageOffset) {
    const absolutePageOffset = pageOffset * this._tabsMeasurements[position].width;
    let newScrollX = this._tabsMeasurements[position].left + absolutePageOffset;

    newScrollX -= this.props.scrollOffset;
    newScrollX = newScrollX >= 0 ? newScrollX : 0;

    if (Platform === 'android') {
      this._scrollView.scrollTo({x: newScrollX, y: 0, });
    } else {
      const rightBoundScroll = this._tabContainerMeasurements.width - (this._containerMeasurements.width);
      newScrollX = newScrollX > rightBoundScroll ? rightBoundScroll : newScrollX;
      this._scrollView.scrollTo({x: newScrollX, y: 0, });
    }

  },

  updateTabUnderline(position, pageOffset, tabCount) {
    const lineLeft = this._tabsMeasurements[position].left;
    const lineRight = this._tabsMeasurements[position].right;

    if (position < tabCount - 1) {
      const nextTabLeft = this._tabsMeasurements[position + 1].left;
      const nextTabRight = this._tabsMeasurements[position + 1].right;

      const newLineLeft = (pageOffset * nextTabLeft + (1 - pageOffset) * lineLeft);
      const newLineRight = (pageOffset * nextTabRight + (1 - pageOffset) * lineRight);

      this.state._leftTabUnderline.setValue(newLineLeft);
      this.state._widthTabUnderline.setValue(newLineRight - newLineLeft);
    } else {
      this.state._leftTabUnderline.setValue(lineLeft);
      this.state._widthTabUnderline.setValue(lineRight - lineLeft);
    }
  },

  renderTabOption(name, page) {
    const isTabActive = this.props.activeTab === page;
    const { activeTextColor, inactiveTextColor, textStyle, } = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';

    return <TouchableOpacity
      key={name}
      ref={'tab_' + page}
      accessible={true}
      accessibilityLabel={name}
      accessibilityTraits='button'
      style={[styles.tab, this.props.tabStyle]}
      onPress={() => this.props.goToPage(page)}
      onLayout={this.measureTab.bind(this, page)}
    >
      <View>
        <Text style={[{color: textColor, fontWeight, }, textStyle, ]}>
          {name}
        </Text>
      </View>
    </TouchableOpacity>;
  },

  measureTab(page) {
    const tabContainerhandle = findNodeHandle(this.refs.tabContainer);
    this.refs['tab_' + page].measureLayout(tabContainerhandle, (ox, oy, width, height, pageX, pageY) => {
      this._tabsMeasurements[page] = {left: ox, right: ox + width, width: width, height: height, };

      this.updateView({value: this.props.scrollValue._value, });
    });
  },

  render() {
    const tabUnderlineStyle = {
      position: 'absolute',
      height: this.props.underlineHeight,
      backgroundColor: this.props.underlineColor,
      bottom: 0,
    };

    const dynamicTabUnderline = {
      left: this.state._leftTabUnderline,
      width: this.state._widthTabUnderline,
    };

    return  <View
      style={[styles.container, {backgroundColor: this.props.backgroundColor, }, this.props.style]}
      onLayout={this.onContainerLayout}
    >
      <ScrollView
        ref={(scrollView) => { this._scrollView = scrollView; }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.scrollableContainer}
        directionalLockEnabled={true}
        scrollEventThrottle={16}
        bounces={false}
      >
        <View
          style={[styles.tabs, {width: this.state._containerWidth, }, this.props.tabsContainerStyle]}
          ref={'tabContainer'}
          onLayout={this.onTabContainerLayout}
        >
          {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
          <Animated.View style={[tabUnderlineStyle, dynamicTabUnderline, ]} />
        </View>
      </ScrollView>
    </View>;
  },

  onTabContainerLayout(e) {
    this._tabContainerMeasurements = e.nativeEvent.layout;
    let width = this._tabContainerMeasurements.width;
    if (width < WINDOW_WIDTH) {
      width = WINDOW_WIDTH;
    }
    this.setState({ _containerWidth: width, });
  },

  onContainerLayout(e) {
    this._containerMeasurements = e.nativeEvent.layout;
  },
});

module.exports = ScrollableTabBar;

const styles = StyleSheet.create({
  tab: {
    height: TAB_HEIGHT - 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
    paddingLeft: 20,
    paddingRight: 20,
  },
  container: {
    height: TAB_HEIGHT,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomColor: '#ccc',
  },
  tabs: {
    height: TAB_HEIGHT - 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scrollableContainer: {
    height: TAB_HEIGHT,
  },
});
