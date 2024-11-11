import { FunctionComponent } from "react";

export type UserDropDownType = {
  className?: string;
  onClose: () => void;
};

const UserDropDown: FunctionComponent<UserDropDownType> = ({
  className = "",
}) => {
  return (
    <div
      className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-[302px] h-[360px] max-w-full max-h-full overflow-auto ${className}`}
    >
      <div className="shadow-[0px_30px_30px_rgba(0,_0,_0,_0.1)] rounded-3xs bg-other-white w-full h-full" />
    </div>
  );
};

export default UserDropDown;