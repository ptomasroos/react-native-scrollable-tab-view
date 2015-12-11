## react-native-scrollable-tab-view

This is probably my favorite navigation pattern on Android, I wish it
were more common on iOS! This is a very simple JavaScript-only
implementation of it for React Native. For more information about how
the animations behind this work, check out the Rebound section of the
[React Native Animation Guide](https://facebook.github.io/react-native/docs/animations.html)

Tested with react-native 0.15

## Add it to your project

1. Run `npm install react-native-scrollable-tab-view --save`
2. `var ScrollableTabView = require('react-native-scrollable-tab-view');`

## Demo

<a href="https://raw.githubusercontent.com/brentvatne/react-native-scrollable-tab-view/master/demo.gif"><img src="https://raw.githubusercontent.com/brentvatne/react-native-scrollable-tab-view/master/demo.gif" width="350"></a>
<a href="https://raw.githubusercontent.com/brentvatne/react-native-scrollable-tab-view/master/demo-fb.gif"><img src="https://raw.githubusercontent.com/brentvatne/react-native-scrollable-tab-view/master/demo-fb.gif" width="350"></a>

## Basic usage

```javascript
var ScrollableTabView = require('react-native-scrollable-tab-view');

var App = React.createClass({
  render() {
    return (
      <ScrollableTabView>
        <ReactPage tabLabel="React" />
        <FlowPage tabLabel="Flow" />
        <JestPage tabLabel="Jest" />
      </ScrollableTabView>
    );
  }
}
```

## Injecting a custom tab bar

Suppose we had a custom tab bar called `CustomTabBar`, we would inject
it into our `ScrollableTabView` like this:

```javascript
var ScrollableTabView = require('react-native-scrollable-tab-view');
var CustomTabBar = require('./CustomTabBar');

var App = React.createClass({
  render() {
    return (
      <ScrollableTabView renderTabBar={() => <CustomTabBar someProp={'here'} />}>
        <ReactPage tabLabel="React" />
        <FlowPage tabLabel="Flow" />
        <JestPage tabLabel="Jest" />
      </ScrollableTabView>
    );
  }
}
```

## Example

See
[examples/FacebookTabsExample](https://github.com/brentvatne/react-native-scrollable-tab-view/tree/master/examples/FacebookTabsExample).

## Props

- **`renderTabBar`** _(Function:ReactComponent)_ - should return a component to use as
  the tab bar. The component has `goToPage`, `tabs`, `activeTab` and
  `ref` added to the props, and should implement `setAnimationValue` to
  be able to animate itself along with the tab content.
- **`tabBarPosition`** _(String)_ - if `"top"`, the tab bar will render above the tabs. If `"bottom"`, the tab bar will render below the tabs. Defaults to `"top"`.
- **`onChangeTab`** _(Function)_ - function to call when tab changes, should accept 1 argument which is an Object containing two keys: `i`: the index of the tab that is selected, `ref`: the ref of the tab that is selected
- **`locked`** _(Bool)_ - disables horizontal dragging to scroll between tabs, default is false.
- **`initialPage`** _(Integer)_ - the index of the initially selected tab, defaults to 0 === first tab.
- **`children`** _(ReactComponents)_ - each top-level child component should have a `tabLabel` prop that can be used by the tab bar component to render out the labels. The default tab bar expects it to be a string, but you can use anything you want if you make a custom tab bar.
- **`tabBarUnderlineColor`** _(String)_ - color of the default tab bar's underline, defaults to `navy`
- **`tabBarBackgroundColor`** _(String)_ - color of the default tab bar's background, defaults to `white`
- **`tabBarActiveTextColor`** _(String)_ - color of the default tab bar's text when active, defaults to `navy`
- **`tabBarInactiveTextColor`** _(String)_ - color of the default tab bar's text when inactive, defaults to `black`
---

**MIT Licensed**
