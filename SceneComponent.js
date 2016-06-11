const React = require('react');
const ReactNative = require('react-native');
const {Component, } = React;
const {View, StyleSheet, } = ReactNative;

const StaticContainer = require('react-static-container');

class SceneComponent extends Component {
  render() {
    let {selected, ...props, } = this.props;
    return(
      <View {...props}>
        <StaticContainer shouldUpdate={selected}>
          {this.props.children}
        </StaticContainer>
      </View>
    );
  }
}

module.exports = SceneComponent;
