'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} = React;

const Icon = require('react-native-vector-icons/Ionicons');
const AnimatedIcon = Animated.createAnimatedComponent(Icon);

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
    paddingTop: 5,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  icon: {
    position: 'absolute',
    top: 4,
    left: 20,
  },
});

var FacebookTabBar = React.createClass({
  selectedTabIcons: [],
  unselectedTabIcons: [],

  propTypes: {
    goToPage: React.PropTypes.func,
    activeTab: React.PropTypes.number,
    tabs: React.PropTypes.array,
    underlineColor : React.PropTypes.string,
    backgroundColor : React.PropTypes.string,
    activeTextColor : React.PropTypes.string,
    inactiveTextColor : React.PropTypes.string,
  },

  renderTabOption(name, page) {
    var isTabActive = this.props.activeTab === page;

    let inputRange = [page -1, page, page+1];

    var iconScale = this.props.scrollValue.interpolate({
      inputRange: inputRange,
      outputRange: [.95, 1.15, .95],
      extrapolate: 'clamp'
    });

    return (
      <TouchableOpacity key={name} onPress={() => this.props.goToPage(page)} style={styles.tab}>
        <AnimatedIcon name={name} size={30} color={this.props.activeTextColor} style={[styles.icon, {transform:[{scale: iconScale}]}]}
            ref={(icon) => { this.selectedTabIcons[page] = icon }}/>

        <AnimatedIcon name={name} size={30} color={this.props.inactiveTextColor} style={[styles.icon, {transform:[{scale: iconScale}]}]}
        ref={(icon) => { this.unselectedTabIcons[page] = icon }}/>
      </TouchableOpacity>
    );
  },

  componentDidMount() {
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

  render() {
    var containerWidth = this.props.containerWidth;
    var numberOfTabs = this.props.tabs.length;
    var tabUnderlineStyle = {
      position: 'absolute',
      width: containerWidth / numberOfTabs,
      height: 3,
      backgroundColor: this.props.underlineColor,
      bottom: 0,
    };

    var translateX = this.props.scrollValue.interpolate({
      inputRange: [0, 1], outputRange: [0, containerWidth / numberOfTabs]
    });

    return (
      <View>
        <View style={[styles.tabs, this.props.style, {backgroundColor: this.props.backgroundColor}]}>
          {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
        </View>
        <Animated.View style={[tabUnderlineStyle, {transform:[{translateX: translateX}]}]} />
      </View>
    );
  },
});

module.exports = FacebookTabBar;
