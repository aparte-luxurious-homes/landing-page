import React, { useState } from 'react';
import ListFlow1 from '../pages/listAparteFlow/listFlow1';
import ListFlow2 from '../pages/listAparteFlow/listFlow2';
import ListFlow3 from '../pages/listAparteFlow/listFlow3';
import ListFlow4 from '../pages/listAparteFlow/listFlow4'; 
import ListFlow5 from '../pages/listAparteFlow/listFlow5';
import ListFlow6 from '../pages/listAparteFlow/listFlow6';
import ListFlow7 from '../pages/listAparteFlow/listFlow7';

const ListApartePage: React.FC = () => {
  const [currentFlow, setCurrentFlow] = useState(1);
  const [formData, setFormData] = useState({
    apartmentType: '',
    sections: [],
    description: '', // Add other fields as needed
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
      case 4:
        return <ListFlow4 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />;
      case 5:
        return <ListFlow5 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />;
      case 6:
          return <ListFlow6 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />;
      case 7:
            return <ListFlow7 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />;
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