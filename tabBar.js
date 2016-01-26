'use strict';

import React, {
  Animated,
  Component,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import Smooth from 'react-native-smooth';

function constrainInRange(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

const AnimatedView = (
  Animated.createAnimatedComponent(
    Smooth.createSmoothComponent(View, [
      new Smooth.NumbericPropMeta({
        propName: 'style.left',
        getFromProps: function(props) {
          return props.style && props.style.left;
        },
        propsIntegrator: function(value) {
          return function(previousState, currentProps) {
            return {style: {...currentProps.style, ...previousState.style, left: value}};
          };
        }
      }),
      new Smooth.NumbericPropMeta({
        propName: 'style.width',
        getFromProps: function(props) {
          return props.style && props.style.width;
        },
        propsIntegrator: function(value) {
          return function(previousState, currentProps) {
            return {style: {...currentProps.style, ...previousState.style, width: value}};
          };
        }
      })
    ])
  )
);

const AnimatedScrollView = (
  Animated.createAnimatedComponent(
    Smooth.createSmoothComponent(ScrollView, [
      new Smooth.CoordinatePropMeta({propName: 'contentOffset'})
    ])
  )
);

class TabBar extends Component {
  static propTypes = {
    goToPage: React.PropTypes.func,
    activeTab: React.PropTypes.number,
    tabs: React.PropTypes.array,
    underlineColor : React.PropTypes.string,
    backgroundColor : React.PropTypes.string,
    activeTextColor : React.PropTypes.string,
    inactiveTextColor : React.PropTypes.string,
  };
  styles = {
    root: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingLeft: 6,
      paddingRight: 6
    },
    leftButton: {
      backgroundColor: 'white',
      width: 28,
      height: 28
    },
    rightButton: {
      backgroundColor: 'white',
      width: 28,
      height: 28
    },
    scrollView: {
      flex: 1,
      marginLeft: 6,
      marginRight: 6
    },
    contentContainer: {
      flex: 1,
      height: 44,
      position: 'relative',
    },
    highlight: {
      borderColor: '#333',
      borderRadius: 14,
      borderWidth: 14,
      position: 'absolute',
      top: 8,
      bottom: 8,
    },
    tabOption: {
      root: {
        alignItems: 'center',
        backgroundColor: 'transparent',
        flex: 1,
        justifyContent: 'center',
        padding: 10
      },
      text: {
        fontSize: 16
      }
    }
  };
  constructor() {
    super(...arguments);
  }
  render() {
    const props = this.props;
    const state = this.state;
    const styles = this.styles;

    const containerWidth = props.containerWidth;
    const numberOfTabs = props.tabs.length;

    const {contentSizeOfScrollView, layoutOfScrollView, layoutsOfTabOptions} = state || {};
    if (contentSizeOfScrollView && layoutOfScrollView && layoutsOfTabOptions && layoutsOfTabOptions.length) {
      const inputRange = [];
      const outputRangeLeft = [];
      const outputRangeWidth = [];
      const outputRangeOffset = [];
      const maxOffsetX = Math.max(contentSizeOfScrollView.width - layoutOfScrollView.width, 0);
      let temp = 0;
      layoutsOfTabOptions.forEach(function({width}, index) {
        inputRange.push(index);
        outputRangeLeft.push(temp);
        outputRangeWidth.push(width);
        outputRangeOffset.push(constrainInRange(
          /* value */ temp - (layoutOfScrollView.width - width) / 2,
          /* min   */ 0,
          /* max   */ maxOffsetX
        ));
        temp += width;
      });

      if (inputRange.length > 1) {
        const left = this.props.scrollValue.interpolate({
          inputRange: inputRange,
          outputRange: outputRangeLeft,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp'
        });

        const width = this.props.scrollValue.interpolate({
          inputRange: inputRange,
          outputRange: outputRangeWidth,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp'
        });

        var offset = this.props.scrollValue.interpolate({
          inputRange: inputRange,
          outputRange: outputRangeOffset,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          mapping: x => ({x})
        });
      }

      var highlight = (
        <AnimatedView
          smoothEnabled={this.props.smoothEnabled}
          style={[
            styles.highlight, this.props.highlightStyle, {left, width}
          ]}
        />
      );
    }

    const LeftButton = props.renderLeftButton || View;
    const RightButton = props.renderRightButton || View;

    return (
      <View style={[styles.root, this.props.style]}>
        <LeftButton style={[styles.leftButton, this.props.leftButtonStyle]} />
        <AnimatedScrollView
          automaticallyAdjustContentInsets={false}
          contentContainerStyle={styles.contentContainer}
          contentOffset={offset}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.scrollView}
          smoothEnabled={this.props.smoothEnabled}
          onContentSizeChange={this.scrollViewOnContentSizeChange.bind(this)}
          onLayout={this.scrollViewOnLayout.bind(this)}
          onScroll={this.scrollViewOnScroll.bind(this)}>
          {highlight}
          {this.props.tabs.map(this.renderTabOption.bind(this))}
        </AnimatedScrollView>
        <RightButton style={[styles.rightButton, this.props.rightButtonStyle]} />
      </View>
    );
  }
  renderTabOption(name, index) {
    const styles = this.styles.tabOption;
    const color = this.props.scrollValue.interpolate({
      inputRange: [index - 1, index, index + 1],
      outputRange: ['white', 'yellow', 'white']
    });
    return (
      <TouchableOpacity
        key={name}
        activeOpacity={0.9}
        style={styles.root}
        onPress={e => this.props.goToPage(index)}
        onLayout={e => this.tabOptionOnLayout(e, index)}>
        <Animated.Text style={[styles.text, {color}]}>{name}</Animated.Text>
      </TouchableOpacity>
    );
  }
  scrollViewOnContentSizeChange(width, height) {
    this.setState({contentSizeOfScrollView: {width, height}});
  }
  scrollViewOnLayout({nativeEvent:{layout}}) {
    this.setState({layoutOfScrollView: layout});
  }
  scrollViewOnScroll({nativeEvent:{contentOffset:{x}}}) {
    this.scrollViewContentOffsetX = x;
  }
  tabOptionOnLayout({nativeEvent:{layout}}, page) {
    const {layoutsOfTabOptions = []} = this.state || {};
    layoutsOfTabOptions[page] = layout;
    this.setState({layoutsOfTabOptions});
  }
}

export default TabBar;
