// @flow
import React from 'react';
import { StyleSheet, Text, View, Animated, ViewPropTypes } from 'react-native';

import Button from './Button';

type ViewProps = React.ElementProps<typeof View>;
type ViewStyleProp = $PropertyType<ViewProps, 'style'>;

type TextProps = React.ElementProps<typeof Text>;
type TextStyleProp = $PropertyType<TextProps, 'style'>;

export type Props = {
  goToPage?: Function,
  activeTab?: number,
  tabs: Array<any>, // TODO what is this actually
  backgroundColor: string,
  activeTextColor: string,
  inactiveTextColor: string,
  textStyle: TextStyleProp,
  tabStyle: ViewStyleProp,
  renderTab: Function,
  underlineStyle: ViewStyleProp,
};

class DefaultTabBar extends React.Component<Props> {
  static defaultProps = {
    activeTextColor: 'navy',
    inactiveTextColor: 'black',
    backgroundColor: null,
  };

  renderTabOption(name: string, page: number) {}

  renderTab(
    name: string,
    page: number,
    isTabActive: boolean,
    onPressHandler: Function,
  ) {
    const {
      activeTextColor,
      inactiveTextColor,
      textStyle,
      tabStyle,
    } = this.props;

    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';

    return (
      <Button
        style={{ flex: 1 }}
        key={name}
        accessible={true}
        accessibilityLabel={name}
        accessibilityTraits="button"
        onPress={() => onPressHandler(page)}
      >
        <View style={[styles.tab, tabStyle]}>
          <Text style={[{ color: textColor, fontWeight }, textStyle]}>
            {name}
          </Text>
        </View>
      </Button>
    );
  }

  render() {
    const {
      activeTab,
      containerWidth,
      tabs,
      renderTab,
      goToPage,
      backgroundColor,
      style,
      scrollValue,
      underlineStyle,
    } = this.props;
    const numberOfTabs = tabs.length;

    const translateX = scrollValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, containerWidth / numberOfTabs],
    });

    return (
      <View style={[styles.tabs, { backgroundColor }, style]}>
        {this.props.tabs.map((name, page) => {
          const isTabActive = activeTab === page;
          const renderTab = renderTab || this.renderTab;
          return renderTab(name, page, isTabActive, goToPage);
        })}
        <Animated.View
          style={[
            styles.tabUnderline,
            {
              width: containerWidth / numberOfTabs,
              transform: [{ translateX }],
            },
            underlineStyle,
          ]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  tabs: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#ccc',
  },
  tabUnderline: {
    position: 'absolute',
    height: 4,
    backgroundColor: 'navy',
    bottom: 0,
  },
});

export default DefaultTabBar;
