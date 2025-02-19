import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "./pagelayout/index";

interface UserTypeSectionProps {
  onSelect: (userType: "GUEST" | "OWNER" | "AGENT") => void;
}

const UserTypeSection: React.FC<UserTypeSectionProps> = ({ onSelect }) => {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // const action = searchParams.get("action");

  const handleUserTypeClick = (userType: "GUEST" | "OWNER" | "AGENT") => {
    // if (action) {
      navigate(`/signup?type=${userType}`);
    // }
    onSelect(userType);
  };

  return (
    <PageLayout
      children={
        <div className="flex flex-col items-center justify-center py-20 px-6 md:pt-40 ">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            Are you a guest, agent or home owner?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div
              className="flex items-center justify-center h-56 p-14 bg-[#FAFEFF] rounded-md shadow-md border hover:bg-[#028090] hover:shadow-lg cursor-pointer"
              onClick={() => handleUserTypeClick("GUEST")}
            >
              <span className="text-lg font-medium text-gray-700">I'm a guest</span>
            </div>
            <div
              className="flex items-center justify-center h-56 p-14 bg-[#FAFEFF] rounded-md shadow-md border hover:bg-[#028090] hover:shadow-lg cursor-pointer"
              onClick={() => handleUserTypeClick("AGENT")}
            >
              <span className="text-lg font-medium text-gray-700">I'm an agent</span>
            </div>
            <div
              className="flex items-center justify-center h-56 p-14 bg-[#FAFEFF] rounded-md shadow-md border hover:bg-[#028090] hover:shadow-lg cursor-pointer"
              onClick={() => handleUserTypeClick("OWNER")}
            >
              <span className="text-lg font-medium text-gray-700">I'm a home owner</span>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default UserTypeSection;