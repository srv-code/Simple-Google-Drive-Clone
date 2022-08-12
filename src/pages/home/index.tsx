import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IState } from '../../models/reducers/state';
import { logOut } from '../../store/auth/actions';
import './styles.css';

const Home: React.FC = props => {
  const dispatch = useDispatch();

  const { username, token } = useSelector((state: IState) => state.auth);

  return (
    <div>
      <h2>Welcome {username}</h2>

      <div>Token: {token}</div>

      <div>
        <button onClick={() => dispatch(logOut())}>Logout</button>
      </div>
    </div>
  );
};

export default Home;
