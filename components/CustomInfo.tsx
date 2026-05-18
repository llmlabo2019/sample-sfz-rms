import React from 'react';

interface CustomInfoProps {
    show : boolean;
    message: string;
    onClose: () => void;
}

const CustomInfo: React.FC<CustomInfoProps> = ({ show, message, onClose }) => {
    if (!show) return null;

    return (
      <div className='customalart'>
        <div className='customalart__body'>
          <p>{message}</p>
          <button onClick={onClose}>OK</button>
        </div>
      </div>
    );
};

export default CustomInfo;
