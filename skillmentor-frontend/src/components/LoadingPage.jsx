import React from 'react';
import '../styles/LoadingPage.css';

const LoadingPage = () => {
  return (
    <div className='w-full h-screen flex items-center justify-center overflow-hidden'>
      <h1 className='titleAnimation text-[8rem] font-bold text-white flex items-center justify-center gap-8'>
        <span className='slideInLeft'>SKILL</span>
        <span className='text-[#8C49E9] slideInRight'>MENTOR</span>
      </h1>
    </div>
  );
};

export default LoadingPage;
