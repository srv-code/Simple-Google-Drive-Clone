import React from 'react';

interface IProps {
  size?: 'large' | 'medium' | 'small';
}

const Loader: React.FC<IProps> = props => {
  const sizeValue =
    props.size === 'large'
      ? 40
      : props.size === 'medium'
      ? 15
      : props.size === 'small'
      ? 5
      : 0;

  return (
    <img
      src={require('../../assets/images/loading.gif')}
      alt='Loading...'
      height={sizeValue}
      width={sizeValue}
    />
  );
};

Loader.defaultProps = {
  size: 'medium',
};

export default Loader;
