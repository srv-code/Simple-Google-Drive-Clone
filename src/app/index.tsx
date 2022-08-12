import React, { useState } from 'react';
import Home from '../pages/home';
import Login from '../pages/login';
import './styles.css';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  return (
    <div className='App'>
      App {String(isLoggedIn)}
      {isLoggedIn ? <Home username={username} /> : <Login />}
    </div>
  );
};

export default App;
