// @flow
import * as React from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ScrollView,
  Text,
  Platform,
  Dimensions,
  ViewPropTypes,
  findNodeHandle,
} from 'react-native';
import _ from 'underscore';

import Button from './Button';

import type AnimatedValue from 'react-native/Libraries/Animated/src/nodes/AnimatedValue';

type ViewProps = React.ElementProps<typeof View>;
type ViewStyleProp = $PropertyType<ViewProps, 'style'>;

type TextProps = React.ElementProps<typeof Text>;
type TextStyleProp = $PropertyType<TextProps, 'style'>;

type Props = {
  goToPage?: Function,
  activeTab?: number,
  tabs: Array<string>,
  backgroundColor: string,
  activeTextColor: string,
  inactiveTextColor: string,
  scrollOffset: number,
  style: ViewStyleProp,
  tabStyle: ViewStyleProp,
  tabsContainerStyle: ViewStyleProp,
  textStyle: TextStyleProp,
  renderTab: Function,
  underlineStyle: ViewStyleProp,
  onScroll: Function,
  scrollValue: AnimatedValue,
};

type State = {
  containerWidth: number,
  leftTabUnderline: AnimatedValue,
  widthTabUnderline: AnimatedValue,
};

const WINDOW_WIDTH = Dimensions.get('window').width;

class ScrollableTabBar extends React.Component<Props, State> {
  tabsMeasurements: Array<Object>;
  containerMeasurements: Object;
  tabContainerMeasurements: Object;
  scrollViewRef: Object;
  containerRef: Object;

  constructor(props: Props) {
    super(props);

    this.tabsMeasurements = [];
    this.scrollViewRef = React.createRef();
    this.containerRef = React.createRef();

    this.state = {
      containerWidth: 0,
      leftTabUnderline: new Animated.Value(0),
      widthTabUnderline: new Animated.Value(0),
    };
  }

  static defaultProps = {
    scrollOffset: 52,
    activeTextColor: 'navy',
    inactiveTextColor: 'black',
    backgroundColor: null,
    style: {},
    tabStyle: {},
    tabsContainerStyle: {},
    underlineStyle: {},
  };

  componentDidMount() {
    const { scrollValue } = this.props;
    scrollValue.addListener(this.updateView);
  }

  updateView = (offset: Object) => {
    const { tabs } = this.props;

    const position = Math.floor(offset.value);
    const pageOffset = offset.value % 1;
    const tabCount = tabs.length;
    const lastTabPosition = tabCount - 1;

    if (tabCount === 0 || offset.value < 0 || offset.value > lastTabPosition) {
      return;
    }

    if (
      this.necessarilyMeasurementsCompleted(
        position,
        position === lastTabPosition,
      )
    ) {
      this.updateTabPanel(position, pageOffset);
      this.updateTabUnderline(position, pageOffset, tabCount);
    }
  };

  necessarilyMeasurementsCompleted(position: number, isLastTab: boolean) {
    return (
      this.tabsMeasurements[position] &&
      (isLastTab || this.tabsMeasurements[position + 1]) &&
      this.tabContainerMeasurements &&
      this.containerMeasurements
    );
  }

  updateTabPanel(position: number, pageOffset: number) {
    const containerWidth = this.containerMeasurements.width;
    const tabWidth = this.tabsMeasurements[position].width;
    const nextTabMeasurements = this.tabsMeasurements[position + 1];
    const nextTabWidth =
      (nextTabMeasurements && nextTabMeasurements.width) || 0;
    const tabOffset = this.tabsMeasurements[position].left;
    const absolutePageOffset = pageOffset * tabWidth;
    let newScrollX = tabOffset + absolutePageOffset;

    // center tab and smooth tab change (for when tabWidth changes a lot between two tabs)
    newScrollX -=
      (containerWidth -
        (1 - pageOffset) * tabWidth -
        pageOffset * nextTabWidth) /
      2;
    newScrollX = newScrollX >= 0 ? newScrollX : 0;

    if (Platform.OS === 'android') {
      this.scrollViewRef.scrollTo({ x: newScrollX, y: 0, animated: false });
    } else {
      const rightBoundScroll =
        this.tabContainerMeasurements.width - this.containerMeasurements.width;
      newScrollX =
        newScrollX > rightBoundScroll ? rightBoundScroll : newScrollX;
      this.scrollViewRef.scrollTo({ x: newScrollX, y: 0, animated: false });
    }
  }

  updateTabUnderline(position: number, pageOffset: number, tabCount: number) {
    const lineLeft = this.tabsMeasurements[position].left;
    const lineRight = this.tabsMeasurements[position].right;

    if (position < tabCount - 1) {
      const nextTabLeft = this.tabsMeasurements[position + 1].left;
      const nextTabRight = this.tabsMeasurements[position + 1].right;

      const newLineLeft =
        pageOffset * nextTabLeft + (1 - pageOffset) * lineLeft;
      const newLineRight =
        pageOffset * nextTabRight + (1 - pageOffset) * lineRight;

      this.state.leftTabUnderline.setValue(newLineLeft);
      this.state.widthTabUnderline.setValue(newLineRight - newLineLeft);
    } else {
      this.state.leftTabUnderline.setValue(lineLeft);
      this.state.widthTabUnderline.setValue(lineRight - lineLeft);
    }
  }

  renderTab(
    name: string,
    page: number,
    isTabActive: boolean,
    onPressHandler: Function,
    onLayoutHandler: Function,
  ) {
    const { activeTextColor, inactiveTextColor, textStyle } = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';

    return (
      <Button
        key={`${name}_${page}`}
        accessible={true}
        accessibilityLabel={name}
        accessibilityTraits="button"
        onPress={() => onPressHandler(page)}
        onLayout={onLayoutHandler}
      >
        <View style={[styles.tab, this.props.tabStyle]}>
          <Text style={[{ color: textColor, fontWeight }, textStyle]}>
            {name}
          </Text>
        </View>
      </Button>
    );
  }

  measureTab = (page: number, event: Object) => {
    const { x, width, height } = event.nativeEvent.layout;
    this.tabsMeasurements[page] = { left: x, right: x + width, width, height };
    this.updateView({ value: this.props.scrollValue.__getValue() });
  };

  componentDidUpdate(prevProps: Props) {
    const { tabs: prevTabs } = prevProps;
    const { tabs } = this.props;
    const { containerWidth } = this.state;

    if (!_.isEqual(tabs, prevTabs) && containerWidth) {
      this.containerRef.measure((x, y, width, height, pageX, pageY) => {
        this.setState({ containerWidth: width });
      });
    }
  }

  onTabContainerLayout = (e: Object) => {
    this.tabContainerMeasurements = e.nativeEvent.layout;
    let width = this.tabContainerMeasurements.width;
    if (width < WINDOW_WIDTH) {
      width = WINDOW_WIDTH;
    }
    this.setState({ containerWidth: width });
    this.updateView({ value: this.props.scrollValue.__getValue() });
  };

  onContainerLayout = (e: Object) => {
    this.containerMeasurements = e.nativeEvent.layout;
    this.updateView({ value: this.props.scrollValue.__getValue() });
  };

  render() {
    const tabUnderlineStyle = {
      position: 'absolute',
      height: 4,
      backgroundColor: 'navy',
      bottom: 0,
    };

    const dynamicTabUnderline = {
      left: this.state.leftTabUnderline,
      width: this.state.widthTabUnderline,
    };

    return (
      <View
        ref={this.containerRef}
        style={[
          styles.container,
          { backgroundColor: this.props.backgroundColor },
          this.props.style,
        ]}
        onLayout={this.onContainerLayout}
      >
        <ScrollView
          ref={this.scrollViewRef}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          directionalLockEnabled={true}
          bounces={false}
          scrollsToTop={false}
        >
          <View
            style={[
              styles.tabs,
              { width: this.state.containerWidth },
              this.props.tabsContainerStyle,
            ]}
            ref={'tabContainer'}
            onLayout={this.onTabContainerLayout}
          >
            {this.props.tabs.map((name, page) => {
              const isTabActive = this.props.activeTab === page;
              const renderTab = this.props.renderTab || this.renderTab;
              return renderTab(
                name,
                page,
                isTabActive,
                this.props.goToPage,
                this.measureTab,
              );
            })}
            <Animated.View
              style={[
                tabUnderlineStyle,
                dynamicTabUnderline,
                this.props.underlineStyle,
              ]}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tab: {
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  container: {
    height: 50,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#ccc',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default ScrollableTabBar;
