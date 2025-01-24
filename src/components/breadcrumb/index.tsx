import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import React from "react";

interface BreadCrumbProps {
  description: string;
  active: string;
  link_one: string;
  link_one_name: string;
  link_two?: string;
  link_two_name?: string;
}

const BreadCrumb: React.FC<BreadCrumbProps> = ({
  description,
  active,
  link_one,
  link_one_name,
  link_two,
  link_two_name,
}) => {
  const breadcrumbs = [
    <Link key="1" to={link_one} className="text-[#667185] no-underline tracking-[-0.4px]">
      {link_one_name}
    </Link>,
    link_two && link_two_name && (
      <Link key="2" to={link_two} className="text-[#667185] no-underline tracking-[-0.4px]">
        {link_two_name}
      </Link>
    ),
    <div key="3" className="text-primary no-underline tracking-[-0.2px] font-bold">
      {active}
    </div>,
  ];

  return (
    <>
      <Stack spacing={2}>
        <Breadcrumbs separator="›" aria-label="breadcrumb" className="text-sm text-[#1C1B1F] mt-[1px]">
          {breadcrumbs}
        </Breadcrumbs>
      </Stack>
      <div className="text-left text-[#667185] text-sm">{description}</div>
    </>
  );
};

export default BreadCrumb;
