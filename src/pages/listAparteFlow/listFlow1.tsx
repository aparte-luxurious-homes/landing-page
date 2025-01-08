import React from 'react';
import HouseIcon from '@mui/icons-material/House';
import backgroundImage from '../../assets/images/listgrid.png'; // Update the path to your background image

const Flow1: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6 md:pt-60"
      style={{ 
        backgroundImage: `url(${backgroundImage})`, 
        backgroundSize: 'contain', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat', 
        width: '100%', 
        maxWidth: '1200px', 
        margin: '0 auto',
        minHeight: 'calc(100vh - 100px)',
        height: '100vh', 
      }}
    >
      <h1 className="text-3xl md:text-4xl text-[#028090] mb-6 md:mb-8">List Your Aparte</h1>
      <div className="border border-[#028090] rounded-4xl p-4 md:p-8 mb-6 md:mb-8 flex flex-col items-center text-center w-full max-w-xl md:max-w-2xl">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Create a new listing</h2>
        <p className="text-sm md:text-md text-gray-700 mb-4">
          Showcase your property to the right audience <br /> and turn opportunities into reality.
        </p>
        <button
          className="flex items-center px-6 py-2 md:px-24 md:py-4 border border-[#028090] text-[#028090] rounded-lg hover:bg-[#028090] hover:text-white transition-colors"
          onClick={onNext}
        >
          <HouseIcon className="mr-2" />
          Add Property
        </button>
      </div>
      <style>{`
        @media (max-width: 768px) {
          div[style] {
            background-image: none !important; 
          }
        }
      `}</style>
    </div>
  );
};

export default Flow1;