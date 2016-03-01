var React = require('react-native');
var {
  View,
  Animated,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Platform,
  Dimensions,
} = React;

import Icon from 'react-native-vector-icons/Ionicons';

const {height: HEIGHT, width: WIDTH} = Dimensions.get('window');

const TAB_HEIGHT = 50;


var ScrollableTabBar = React.createClass({
  selectedTabIcons: [],
  unselectedTabIcons: [],

  getDefaultProps: function() {
    return {
      scrollOffset: 52,
    };
  },

  propTypes: {
    goToPage: React.PropTypes.func,
    activeTab: React.PropTypes.number,
    tabs: React.PropTypes.array,
    underlineColor : React.PropTypes.string,
    backgroundColor : React.PropTypes.string,
    activeTextColor : React.PropTypes.string,
    inactiveTextColor : React.PropTypes.string,
    scrollOffset: React.PropTypes.number,
  },

  getInitialState: function() {
    this._tabsMeasurements = [];
    return {
      _leftTabUnderline: new Animated.Value(0),
      _widthTabUnderline: new Animated.Value(0),
    }
  },

  updateView(offset) {
    const position = Math.floor(offset.value);
    const pageOffset = offset.value % 1;
    const tabCount = this.props.tabs.length;

    if (tabCount == 0 || offset.value < 0 || offset.value > tabCount - 1) {
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
    var newScrollX = this._tabsMeasurements[position].left + absolutePageOffset;

    newScrollX -= this.props.scrollOffset;
    newScrollX = newScrollX >= 0 ? newScrollX : 0;

    if (Platform === 'android') {
      this._scrollView.scrollWithoutAnimationTo(0, newScrollX);
    } else {
      const rightBoundScroll = this._tabContainerMeasurements.width - (this._containerMeasurements.width);
      newScrollX = newScrollX > rightBoundScroll ? rightBoundScroll : newScrollX;
      this._scrollView.scrollWithoutAnimationTo(0, newScrollX);
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
    const activeTextColor = this.props.activeTextColor || "#af1fae";
    const inactiveTextColor = this.props.inactiveTextColor || "#b6b7ba";

    if(this.props.useIcons) return this.renderIconTab(name, page, activeTextColor, inactiveTextColor)

    return (
      <TouchableOpacity
        style={[styles.tab]}
        key={name}
        onPress={() => this.props.goToPage(page)}
        ref={'tab_' + page}
        onLayout={this.measureTab.bind(this, page)}
      >
        <View>
          <Text style={{color: isTabActive ? activeTextColor : inactiveTextColor}}>{name}</Text>
        </View>
      </TouchableOpacity>
    );
  },

  measureTab(page) {
    const tabContainerhandle = React.findNodeHandle(this.refs.tabContainer);
    this.refs['tab_' + page].measureLayout(tabContainerhandle,(ox, oy, width, height, pageX, pageY) => {
      this._tabsMeasurements[page] = {left: ox, right: ox + width, width: width, height: height};

      this.updateView({value : this.props.scrollValue._value});
    });
  },


  renderIconTab(name, page, activeTextColor, inactiveTextColor) {
    var isTabActive = this.props.activeTab === page;

    return (
      <TouchableOpacity
        style={[styles.tab, {width: this.iconTabWidth()}]}
        key={name}
        onPress={() => this.props.goToPage(page)}
        ref={'tab_' + page}
        onLayout={this.measureTab.bind(this, page)}
        >
        <Icon name={name} size={30} color={activeTextColor} style={styles.icon}
              ref={(icon) => { this.selectedTabIcons[page] = icon }}/>

        <Icon name={name} size={30} color={inactiveTextColor} style={styles.icon}
          ref={(icon) => { this.unselectedTabIcons[page] = icon }}/>
      </TouchableOpacity>
    );
  },

  componentDidMount() {
    if(!this.props.useIcons) return;

    this.setAnimationValue({value: this.props.activeTab});
    this._listener = this.props.scrollValue.addListener(this.setAnimationValue);
  },

  setAnimationValue({value}) {
    var currentPage = this.props.activeTab;

    this.unselectedTabIcons.forEach((icon, i) => {
      var iconRef = icon;

      if (!icon.setNativeProps && icon !== null) {
        iconRef = icon.refs.icon_image
      }

      if (value - i >= 0 && value - i <= 1) {
        iconRef.setNativeProps({ style: {opacity: value - i} });
      }
      if (i - value >= 0 &&  i - value <= 1) {
        iconRef.setNativeProps({ style: {opacity: i - value} });
      }
    });
  },

  iconTabWidth() {
    var containerWidth = this.props.containerWidth;
    var numberOfTabs = this.props.tabs.length > 5 ? 5 : this.props.tabs.length;

    return containerWidth / numberOfTabs;
  },
  render() {
    let tabUnderlineStyle = {
      position: 'absolute',
      height: 4,
      backgroundColor: this.props.underlineColor || "#af1fae",
      bottom: 0,
    };

    this.props.scrollValue.addListener(this.updateView);

    const dynamicTabUnderline = {
      left: this.state._leftTabUnderline,
      width: this.state._widthTabUnderline,
    };

    const bgColor = this.props.backgroundColor || '#111010';

    return  <View
      style={[styles.container, {backgroundColor : bgColor, borderBottomColor: bgColor}]}
      onLayout={this.onContainerLayout}
    >
      <ScrollView
        scrollEnabled={this.props.scrollEnabled ? true : false}
        ref={(scrollView) => { this._scrollView = scrollView; }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        styles={styles.scrollableContainer}
        directionalLockEnabled={true}
        scrollEventThrottle={16}
      >
        <View
          style={styles.tabs}
          ref={'tabContainer'}
          onLayout={this.onTabContainerLayout}
        >
          {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
        </View>
        <Animated.View style={[tabUnderlineStyle, dynamicTabUnderline]} />
      </ScrollView>
    </View>
  },

  onTabContainerLayout(e) {
    this._tabContainerMeasurements = e.nativeEvent.layout;
  },

  onContainerLayout(e) {
    this._containerMeasurements = e.nativeEvent.layout;
  }
});

module.exports = ScrollableTabBar;

var styles = StyleSheet.create({
  tab: {
    flex: 1,
    height: TAB_HEIGHT - 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20
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

  icon: {
    position: 'absolute',
    top: 8,
    left: 20,
  },
});
