import React from 'react';

interface IProps {
  color?: string;
  size?: number;
}

const Loader: React.FC<IProps> = props => <div>Loading...</div>;

Loader.defaultProps = {
  color: 'black',
  size: 24,
};

export default Loader;
