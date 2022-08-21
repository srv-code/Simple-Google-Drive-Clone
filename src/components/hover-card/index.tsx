import React from 'react';
import './styles.css';

interface IProps {
  show: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}

const HoverCard: React.FC<IProps> = props => {
  if (!props.show) return null;

  return (
    <>
      <div id='hover-card-backdrop' onClick={props.onDismiss} />
      <div id='hover-card-container'>{props.children}</div>
    </>
  );
};

export default HoverCard;
