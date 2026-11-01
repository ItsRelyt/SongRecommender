import React from 'react';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={onLogoClick} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-black fill-current">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.224-2.719a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.519.781.781 0 01.52-.972c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.256 1.072zm.105-2.835C14.692 8.423 8.228 8.21 4.93 9.212a.936.936 0 11-.543-1.791c3.763-1.141 10.857-.891 14.755 1.44a.936.936 0 01-.936 1.619z"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Sound<span className="text-[#1DB954]">Finder</span>
            </span>
          </button>
          
          <div className="hidden sm:flex items-center gap-4 text-sm text-[#B3B3B3]">
            <span className="flex items-center gap-1.5">
              <i className="fas fa-music text-[#1DB954] text-xs"></i>
              Powered by iTunes API
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
