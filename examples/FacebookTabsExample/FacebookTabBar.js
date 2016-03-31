import React, {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

const FacebookTabBar = React.createClass({
  selectedTabIcons: [],
  unselectedTabIcons: [],

  propTypes: {
    goToPage: React.PropTypes.func,
    activeTab: React.PropTypes.number,
    tabs: React.PropTypes.array,
  },

  renderTabOption(name, page) {
    const isTabActive = this.props.activeTab === page;

    return (
      <TouchableOpacity key={name} onPress={() => this.props.goToPage(page)} style={styles.tab}>
        <Icon name={name} size={30} color='#3B5998' style={styles.icon}
              ref={(icon) => { this.selectedTabIcons[page] = icon; }}/>
        <Icon name={name} size={30} color='#ccc' style={styles.icon}
              ref={(icon) => { this.unselectedTabIcons[page] = icon; }}/>
      </TouchableOpacity>
    );
  },

  componentDidMount() {
    this.setAnimationValue({ value: this.props.activeTab, });
    this._listener = this.props.scrollValue.addListener(this.setAnimationValue);
  },

  setAnimationValue({ value, }) {
    this.unselectedTabIcons.forEach((icon, i) => {
      const opacity = (value - i >= 0 && value - i <= 1) ? value - i : 1;
      icon.setNativeProps({
        style: {
          opacity,
        },
      });
    });
  },

  render() {
    const containerWidth = this.props.containerWidth;
    const numberOfTabs = this.props.tabs.length;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: containerWidth / numberOfTabs,
      height: 3,
      backgroundColor: '#3b5998',
      bottom: 0,
    };

    const left = this.props.scrollValue.interpolate({
      inputRange: [0, 1, ], outputRange: [0, containerWidth / numberOfTabs, ],
    });

    return <View>
      <View style={[styles.tabs, this.props.style, ]}>
        {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
      </View>
      <Animated.View style={[tabUnderlineStyle, { left, }, ]} />
    </View>;
  },
});

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  tabs: {
    height: 45,
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
    top: 0,
    left: 20,
  },
});

export default FacebookTabBar;
