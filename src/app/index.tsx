import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import Loader from '../components/loader';
import { IState } from '../models/reducers/state';
import Home from '../pages/home';
import Login from '../pages/login';
import configureStore from '../store';
import './styles.css';

const { persistor, store } = configureStore();

const Navigator: React.FC = () => {
  const { isLoggedIn } = useSelector((state: IState) => state.auth);

  return <div className='App'>{isLoggedIn ? <Home /> : <Login />}</div>;
};

const App: React.FC = () => (
  <Provider store={store}>
    <PersistGate loading={<Loader />} persistor={persistor}>
      <Navigator />
    </PersistGate>
  </Provider>
);

export default App;
