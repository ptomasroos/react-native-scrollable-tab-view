const React = require('react');

const StaticContainer = React.createClass({
  shouldComponentUpdate(nextProps) {
    return !!nextProps.shouldUpdate;
  },

  render() {
    const child = this.props.children;
    return (child === null || child === false)
      ? null
      : React.Children.only(child);
  },
});

module.exports = StaticContainer;
