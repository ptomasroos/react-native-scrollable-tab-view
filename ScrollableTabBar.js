var React = require('react-native');
var {
  View,
  Animated,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Platform,
} = React;

const TAB_HEIGHT = 50;

var ScrollableTabBar = React.createClass({

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
      this._scrollView.scrollTo({x: newScrollX, y: 0});
    } else {
      const rightBoundScroll = this._tabContainerMeasurements.width - (this._containerMeasurements.width);
      newScrollX = newScrollX > rightBoundScroll ? rightBoundScroll : newScrollX;
      this._scrollView.scrollTo({x: newScrollX, y: 0});
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
    const activeTextColor = this.props.activeTextColor || "navy";
    const inactiveTextColor = this.props.inactiveTextColor || "black";
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

  render() {
    const tabUnderlineStyle = {
      position: 'absolute',
      height: 4,
      backgroundColor: this.props.underlineColor || "navy",
      bottom: 0,
    };

    this.props.scrollValue.addListener(this.updateView);

    const dynamicTabUnderline = {
      left: this.state._leftTabUnderline,
      width: this.state._widthTabUnderline,
    };

    return  <View
      style={[styles.container, {backgroundColor : this.props.backgroundColor || null}]}
      onLayout={this.onContainerLayout}
    >
      <ScrollView
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
          <Animated.View style={[tabUnderlineStyle, dynamicTabUnderline]} />
        </View>
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
  }
});
