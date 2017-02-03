import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view';

const PrevButton = ({ goToPage, ownPosition, }) => (
  <TouchableOpacity onPress={() => goToPage(ownPosition - 1)}>
    <Text>- Prev</Text>
  </TouchableOpacity>
);

const NextButton = ({ goToPage, ownPosition, }) => (
  <TouchableOpacity onPress={() => goToPage(ownPosition + 1)}>
    <Text> Next +</Text>
  </TouchableOpacity>
);

const Step = (props) => {
  const hasPrev = props.ownPosition !== 0;
  const hasNext = props.ownPosition < props.tabs.length - 1;

  return <View>
    <Text>You're at {props.tabLabel}</Text>
    <View style={{ flexDirection: 'row', }}>
      {hasPrev && <PrevButton {...props} />}
      {hasNext && <NextButton {...props} />}
    </View>
  </View>;
};

export default React.createClass({
  render() {
    return <ScrollableTabView
      locked
      style={{marginTop: 20, }}
      renderTabBar={() => <DefaultTabBar />}
    >
      <Step tabLabel='tab1' />
      <Step tabLabel='tab2' />
      <Step tabLabel='tab3' />
    </ScrollableTabView>;
  },
});
