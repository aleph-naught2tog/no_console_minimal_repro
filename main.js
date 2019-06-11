import { activateKeepAwake } from 'expo-keep-awake';

import App from './src/App';
import { AppRegistry } from 'react-native';

if (__DEV__) {
  activateKeepAwake();
}

AppRegistry.registerComponent('main', () => App);
