import React, { useState } from 'react';
import ListFlow1 from '../pages/listAparteFlow/listFlow1';
import ListFlow2 from '../pages/listAparteFlow/listFlow2';
import ListFlow3 from '../pages/listAparteFlow/listFlow3';
import ListFlow4 from '../pages/listAparteFlow/listFlow4';
import ListFlow5 from '../pages/listAparteFlow/listFlow5';
import ListFlow6 from '../pages/listAparteFlow/listFlow6';
import ListFlow7 from '../pages/listAparteFlow/listFlow7';
// import ListFlow8 from '../pages/listAparteFlow/listFlow8';
// import ListFlow9 from '../pages/listAparteFlow/listFlow9';
import ListFlow10 from '../pages/listAparteFlow/listFlow10';
import ListFlow11 from '../pages/listAparteFlow/listFlow11';

interface Section {
  name: string;
  units: number;
  price: string;
}

interface FormData {
  apartmentType: string;
  sections: Section[];
  description: string;
}

const ListApartePage: React.FC = () => {
  const [currentFlow, setCurrentFlow] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    apartmentType: '',
    sections: [],
    description: '',
  });

  const handleNextFlow = () => setCurrentFlow((prev) => Math.min(prev + 1, flows.length));
  const handleBackFlow = () => setCurrentFlow((prev) => Math.max(prev - 1, 1));

  // Array of flow components for dynamic rendering
  const flows = [
    <ListFlow1 onNext={handleNextFlow} />,
    <ListFlow2 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    <ListFlow3 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    <ListFlow4 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    <ListFlow5 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    <ListFlow6 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    <ListFlow7 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    // <ListFlow8 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    // <ListFlow9 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    <ListFlow10 onNext={handleNextFlow} onBack={handleBackFlow}  />,
    <ListFlow11 onNext={handleNextFlow} formData={formData} />,
  ];

  return (
    <div>
      {flows[currentFlow - 1] || <div>Flow not found</div>}
    </div>
  );
};

export default ListApartePage;
