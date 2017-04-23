const React = require('react');

const Tab = props => props.children;

Tab.propTypes = {
  children: React.PropTypes.element,
  tabLabel: React.PropTypes.string,
  icon: React.PropTypes.element,
};

Tab.displayName = 'Tab';

module.exports = Tab;
