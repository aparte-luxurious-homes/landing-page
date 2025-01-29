import React, { useState } from 'react';
import ListFlow1 from '../pages/listAparteFlow/listFlow1';
import ListFlow2 from '../pages/listAparteFlow/listFlow2';
import ListFlow3 from '../pages/listAparteFlow/listFlow3';
import ListFlow4 from '../pages/listAparteFlow/listFlow4'; 
import ListFlow5 from '../pages/listAparteFlow/listFlow5';
import ListFlow6 from '../pages/listAparteFlow/listFlow6';
import ListFlow7 from '../pages/listAparteFlow/listFlow7';
import ListFlow8 from '../pages/listAparteFlow/listFlow8';
import ListFlow9 from '../pages/listAparteFlow/listFlow9';
import ListFlow10 from '../pages/listAparteFlow/listFlow10';
import ListFlow11 from '../pages/listAparteFlow/listFlow11';

interface Section {
  name: string;
  units: number;
  price: string;
}

const ListApartePage: React.FC = () => {
  const [currentFlow, setCurrentFlow] = useState(1);
  const [formData, setFormData] = useState({
    apartmentType: '',
    sections: [] as Section[],
    description: '', 
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
        return <ListFlow2 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />;
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
      case 8:
            return <ListFlow8 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />;
      case 9:
            return <ListFlow9 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />;
      case 10:
            return <ListFlow10 onNext={handleNextFlow} onBack={handleBackFlow} />;   
      case 11:
            return <ListFlow11 onNext={handleNextFlow}  formData={formData}  />;         
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