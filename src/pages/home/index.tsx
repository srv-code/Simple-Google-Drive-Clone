import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FileManager from '../../components/file-manager';
import { IState } from '../../models/reducers/state';
import { logOut } from '../../store/auth/actions';
import './styles.css';

const Home: React.FC = props => {
  const dispatch = useDispatch();

  const { username, token } = useSelector((state: IState) => state.auth);

  return (
    <div>
      <div id='header-row'>
        <div id='username-row'>
          <span>{username}</span>
          <a id='logout-link' href='#' onClick={() => dispatch(logOut())}>
            Logout
          </a>
        </div>
      </div>

      <FileManager token={token!} />
    </div>
  );
};

export default Home;
