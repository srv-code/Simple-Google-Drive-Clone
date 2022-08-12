import React from 'react';
import './styles.css';

interface IProps {
  username: string;
}

const Home: React.FC<IProps> = props => {
  return <div>Home {props.username}</div>;
};

export default Home;
