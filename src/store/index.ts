import { createStore, compose, applyMiddleware } from 'redux';
import { persistStore, persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import rootReducers from './root-reducers';
import rootSagas from './root-sagas';

const middleware = [];
const sagaMiddleware = createSagaMiddleware();
middleware.push(sagaMiddleware);

const composeEnhancers =
  (typeof window !== 'undefined' &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;
const reducers = persistCombineReducers(
  {
    key: 'root',
    storage,
    blacklist: ['loading'],
    debug: true /* NOTE: to get useful logging */,
  },
  rootReducers
);
const enhancers = [applyMiddleware(...middleware)];
// const initialState = {};
const persistConfig: any = { enhancers };
const store = createStore(reducers, composeEnhancers(...enhancers));
// const store = createStore(reducers, undefined, compose(...enhancers));
const persistor = persistStore(store, persistConfig, () => {
  //   console.log('Test', store.getState());
});
const configureStore = () => {
  return { persistor, store };
};

sagaMiddleware.run(rootSagas);

export default configureStore;

// export const store = createStore(countReducer);

// combineReducers(rootReducers)
// const store = createStore(countReducer);

// export default store;
