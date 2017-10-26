import React, {Component, } from 'react';
import ReactNative from 'react-native';
import {View, StyleSheet, } from 'react-native';
import StaticContainer from './StaticContainer';

const SceneComponent = (Props) => {
  const {shouldUpdated, ...props } = Props;
  return <View {...props}>
      <StaticContainer shouldUpdate={shouldUpdated}>
        {props.children}
      </StaticContainer>
  </View>;
};

export default SceneComponent;
