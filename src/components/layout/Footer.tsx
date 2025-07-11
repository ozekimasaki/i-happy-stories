import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-100 border-t border-stone-200">
      <div className="container mx-auto py-4 text-center text-sm text-stone-500">
        <p>&copy; {new Date().getFullYear()} I Happy Stories.</p>
      </div>
    </footer>
  );
};

export default Footer;