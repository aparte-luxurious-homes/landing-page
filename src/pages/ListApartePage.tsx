import React, { useState } from 'react';
import ListFlow1 from '../pages/listAparteFlow/listFlow1';
import ListFlow2 from '../pages/listAparteFlow/listFlow2';
import ListFlow3 from '../pages/listAparteFlow/listFlow3';
// Import other flow components as needed

const ListApartePage: React.FC = () => {
  const [currentFlow, setCurrentFlow] = useState(1);
  const [formData, setFormData] = useState({
    apartmentType: '',
    sections: [],
    // Add other fields as needed
  });

  const handleNextFlow = () => {
    setCurrentFlow((prevFlow) => prevFlow + 1);
  };

  const handleBackFlow = () => {
    setCurrentFlow((prevFlow) => prevFlow - 1);
  };

  const renderFlow = () => {
    switch (currentFlow) {
      case 1:
        return <ListFlow1 onNext={handleNextFlow} />;
      case 2:
        return <ListFlow2 onNext={handleNextFlow} onBack={handleBackFlow} />;
      case 3:
        return <ListFlow3 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />;
      // Add cases for other flows
      default:
        return <div>Flow not found</div>;
    }
  };

  return (
    <div>
      {renderFlow()}
    </div>
  );
};

export default ListApartePage;