import {
  FunctionComponent,
  useMemo,
  type CSSProperties,
  useCallback,
} from "react";

export type GroupComponentType = {
  className?: string;
  maskGroup?: string;
  vuesaxlinearstar4?: string;

  /** Style props */
  groupDivTop?: CSSProperties["top"];
  groupDivLeft?: CSSProperties["left"];

  /** Action props */
  onGroupContainerClick?: () => void;
};

const GroupComponent: FunctionComponent<GroupComponentType> = ({
  className = "",
  groupDivTop,
  onGroupContainerClick,
  groupDivLeft,
  maskGroup,
  vuesaxlinearstar4,
}) => {
  const groupDivStyle: CSSProperties = useMemo(() => {
    return {
      top: groupDivTop,
      left: groupDivLeft,
    };
  }, [groupDivTop, groupDivLeft]);

  const onGroupContainerClick1 = useCallback(() => {
    // Please sync "Apartment Page" to the project
  }, []);

  return (
    <div
      className={`absolute top-[1685px] left-[100px] w-[359px] h-[518px] cursor-pointer text-left text-3xl text-gray-200 font-tt-firs-neue-trl ${className}`}
      onClick={onGroupContainerClick}
      style={groupDivStyle}
    >
      <div className="absolute top-[350px] left-[0px] font-medium inline-block w-[359px]">
        The Skyline Haven Apartment, Lagos
      </div>
      <div className="absolute top-[421px] left-[0px] w-[299px] h-[11px] text-smi-1 text-black">
        <div className="absolute top-[0px] left-[13px] leading-[94%] font-medium inline-block w-[286px]">
          Lekki, Lagos Nigeria
        </div>
        <img
          className="absolute h-[84.55%] w-[2.68%] top-[0%] right-[97.32%] bottom-[15.45%] left-[0%] max-w-full overflow-hidden max-h-full"
          alt=""
          src="/vuesaxlinearlocation1.svg"
        />
      </div>
      <img
        className="absolute top-[0px] left-[0px] w-[359px] h-[330px] object-cover"
        alt=""
        src={maskGroup}
      />
      <div className="absolute h-[5.79%] w-[63.79%] top-[86.29%] right-[36.21%] bottom-[7.92%] left-[0%] text-center text-xs text-other-white">
        <div className="absolute h-[57.33%] w-[44.98%] top-[20%] right-[37.55%] bottom-[22.67%] left-[17.47%]">
          <img
            className="absolute h-full w-[16.8%] top-[0%] right-[83.2%] bottom-[0%] left-[0%] max-w-full overflow-hidden max-h-full"
            alt=""
            src="/vuesaxlinearstar5.svg"
          />
          <img
            className="absolute h-full w-[16.8%] top-[0%] right-[62.43%] bottom-[0%] left-[20.78%] max-w-full overflow-hidden max-h-full"
            alt=""
            src="/vuesaxlinearstar6.svg"
          />
          <img
            className="absolute h-full w-[16.8%] top-[0%] right-[41.65%] bottom-[0%] left-[41.55%] max-w-full overflow-hidden max-h-full"
            alt=""
            src="/vuesaxlinearstar7.svg"
          />
          <img
            className="absolute h-full w-[16.8%] top-[0%] right-[20.78%] bottom-[0%] left-[62.43%] max-w-full overflow-hidden max-h-full"
            alt=""
            src="/vuesaxlinearstar8.svg"
          />
          <img
            className="absolute h-full w-[16.8%] top-[0%] right-[0%] bottom-[0%] left-[83.2%] max-w-full overflow-hidden max-h-full"
            alt=""
            src={vuesaxlinearstar4}
          />
        </div>
        <div className="absolute top-[0px] left-[0px] w-[30px] h-[30px]">
          <div className="absolute top-[0px] left-[0px] rounded-8xs bg-teal w-[30px] h-[30px]" />
          <div className="absolute top-[7px] left-[6px] font-medium">9.5</div>
        </div>
        <div className="absolute top-[10px] left-[153px] font-medium text-gray-200">
          1269 Reviews
        </div>
      </div>
      <div className="absolute top-[492px] left-[0px] w-[105px] h-[26px] text-center text-xl text-teal">
        <div className="absolute top-[0px] left-[0px] font-medium">₦</div>
        <div className="absolute top-[0px] left-[14px] font-medium">
          300,000
        </div>
      </div>
    </div>
  );
};

export default GroupComponent;
