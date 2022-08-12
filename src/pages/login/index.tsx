import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IState } from '../../models/reducers/state';
import { requestLogin } from '../../store/auth/actions';
import validate from '../../utils/regex';
import './styles.css';

type MessageData = { isError: boolean; text: string } | null;

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('Admin@123');
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [messageData, setMessageData] = useState<MessageData>(null);

  const {
    loading: { isLoggingIn },
    auth: { error },
  } = useSelector((state: IState) => state);

  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      setMessageData({ isError: true, text: error });
      setTimeout(() => {
        setMessageData(null);
      }, 2000);
    }
  }, [error]);

  const onLogin = () => {
    if (validate('USERNAME', username) && validate('PASSWORD', password))
      dispatch(requestLogin(username, password));
    else {
      setMessageData({ isError: true, text: 'Invalid credential format' });
      setTimeout(() => {
        setMessageData(null);
      }, 2000);
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <div>
        <div id='login-form'>
          <table>
            <tbody>
              <tr>
                <td>Username</td>
                <td>
                  <input
                    type='text'
                    value={username}
                    onChange={event => setUsername(event.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Password</td>
                <td>
                  <input
                    type={hidePassword ? 'password' : 'text'}
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                  />
                </td>
                <td>
                  <img
                    src={require(`../../assets/images/${
                      hidePassword ? 'eye' : 'no-eye'
                    }.png`)}
                    alt='Hide/Unhide'
                    height={15}
                    width={15}
                    onClick={() => {
                      setHidePassword(!hidePassword);
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <div className='row-items'>
                    <button disabled={isLoggingIn} onClick={onLogin}>
                      Login
                    </button>

                    {isLoggingIn && (
                      <img
                        src={require('../../assets/images/loading.gif')}
                        alt='Loading...'
                        height={15}
                        width={15}
                      />
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                {!!messageData && (
                  <td colSpan={3}>
                    <span id='msg-box'>{messageData.text}</span>
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Login;
