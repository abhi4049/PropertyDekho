import React, { useState } from 'react';

function Navbar() {
    const [showMenu, setShowMenu] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };
    const handleLogin = () => {
        setIsLoggedIn(!isLoggedIn)
    }

    return (
        <nav className="flex items-center justify-between flex-wrap p-4 bg-gray-200">
            <div className="flex items-center flex-shrink-0 text-white mr-6">
                <div className='mx-8 text-secondary text-2xl font-bold'>PropertyDhundo</div>
            </div>
            <div className="block lg:hidden">
                <div className="inline-block text-sm font-semibold p-1 leading-none rounded-full bg-secondary mt-4 lg:mt-0">
                    <img src="https://res.cloudinary.com/dhpc9vkpj/image/upload/v1721540034/igmwo5fqmekup9gnaz10.png" alt="" className='rounded-full w-8 h-8' onClick={toggleMenu} />
                </div>
            </div>
            <div id='menu' className={`w-full ${showMenu ? 'block' : 'hidden'} lg:flex lg:items-center lg:w-auto justify-end`}>
                <div className="text-lg font-semibold mt-2">
                    <a href="#responsive-header" className="block m-3 lg:inline-block lg:mt-0 text-gray-600">Add Property </a>
                    <a href="#responsive-header" className="block m-3 lg:inline-block lg:mt-0 text-gray-600">View Properties</a>
                    <a href="#responsive-header" className="block m-3 lg:inline-block lg:mt-0 font-bold text-secondary">{isLoggedIn ? 'Logout' : 'Login'}</a>
                </div>
            </div>
        </nav>
    );
}
export default Navbar;