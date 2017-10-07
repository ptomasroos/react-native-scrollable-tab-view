const React = require('react');
const PropTypes = require('prop-types');

const Tab = props => props.children;

Tab.propTypes = {
  children: PropTypes.element,
  tabLabel: PropTypes.string,
  icon: PropTypes.element,
  activeIcon: PropTypes.element,
};

Tab.displayName = 'Tab';

module.exports = Tab;