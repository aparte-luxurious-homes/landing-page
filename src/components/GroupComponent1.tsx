import { FunctionComponent } from "react";

export type GroupComponent1Type = {
  className?: string;
};

const GroupComponent1: FunctionComponent<GroupComponent1Type> = ({
  className = "",
}) => {
  return (
    <div
      className={`absolute top-[220px] left-[60px] w-[960px] h-[500px] text-center text-31xl text-other-white font-tt-firs-neue-trl ${className}`}
    >
      <img
        className="absolute top-[0px] left-[35px] w-[1100px] h-[500px] object-cover rounded-21xl "
        alt=""
        src="/mask-group@2x.png"
      />
      <div className="absolute top-[51px] left-[1px] w-[1100px] h-[452px]">
        <div className="absolute top-[0px] left-[1px] w-[1100px] h-[452px]">
          <div className="absolute top-[0px] left-[35px] rounded-t-none rounded-b-21xl [background:linear-gradient(-0.33deg,_rgba(2,_128,_144,_0.8),_rgba(102,_102,_102,_0))] w-[1100px] h-[450px]" />
          <div className="absolute top-[223px] left-[calc(59%_-_305px)] leading-[106%] font-medium inline-block w-[500px]">
               More Than a Stay, It’s a Lifestyle
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupComponent1;
