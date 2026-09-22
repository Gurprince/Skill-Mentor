import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assests/logo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = (
    <div className='w-full bg-black text-white min-h-screen flex flex-col items-center justify-center'>
      <ul className='flex flex-col items-center space-y-2 text-xl w-full text-center'>
        <li className='font-thin w-full'>
          <NavLink 
            to="/" 
            onClick={() => setIsMenuOpen(false)} 
            className={({ isActive }) => `hover:text-[#8C49E9] text-[5rem] font-thin transition-colors ${isActive ? 'text-[#8C49E9] border-b border-gray-100' : 'text-white'}`}
          >
            Home
          </NavLink>
        </li>
        <li>
          <a 
            href="#how-it-work" 
            onClick={() => setIsMenuOpen(false)} 
            className={`hover:text-[#8C49E9] transition-colors text-[5rem] font-thin`}
          >
            How it works
          </a>
        </li>
        <li>
          <a 
            href="#about" 
            onClick={() => setIsMenuOpen(false)} 
            className={`hover:text-[#8C49E9] transition-colors text-[5rem] font-thin`}
          >
            About
          </a>
        </li>
      </ul>
      <div className='flex gap-6 w-80 items-center justify-center mt-8'>
        <button 
          className='bg-[#8C49E9]  hover:scale-105 transition-all hover:border-[#8C49E9] border-2 border-[#8C49E9] text-white px-8 py-2 rounded-lg font-medium transition-colors w-full text-[5rem] font-thin '
          onClick={() => setIsMenuOpen(false)}
        >
          <NavLink to="/login" className="w-full block">Login</NavLink>
        </button>
        <button 
          className='bg-transparent border-2 border-[#8C49E9] hover:bg-[#8C49E9] hover:text-white text-[#8C49E9] px-6 py-2 rounded-lg font-medium transition-colors w-full text-[5rem] font-thin'
          onClick={() => setIsMenuOpen(false)}
        >
          <NavLink to="/register" className="w-full block">Register</NavLink>
        </button>
      </div>
    </div>
  );

  return (
    <nav className='border-b border-gray-200 text-white relative'>
      <div className='flex justify-between items-center py-5 px-6 max-w-full '>
        <img src={logo} alt="" className='w-10' />
        
        {/* Menu button for all screen sizes */}
        {!isMenuOpen && (
          <button 
            onClick={toggleMenu}
            className='text-white focus:outline-none z-50'
            aria-label='Toggle menu'
          >
            {!isMenuOpen ? (
              <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16m-7 6h7'></path>
              </svg>
            ) : (
              <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
              </svg>
            )}
          </button>
        )}
        
        {/* Navigation links - shown when menu is open */}
        {isMenuOpen && (
          <div className='fixed inset-0 bg-black/95 z-40'>
            {navLinks}
            <button 
              onClick={() => setIsMenuOpen(false)}
              className='absolute top-8 right-8 text-white hover:text-gray-300 transition-colors'
              aria-label='Close menu'
            >
              <svg className='w-10 h-10' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
              </svg>
            </button>
          </div>
        )}
      </div>


    </nav>
  );
};

export default Navbar;