import { FunctionComponent } from "react";

export type PropertyTypesType = {
  className?: string;
};

const PropertyTypes: FunctionComponent<PropertyTypesType> = ({
  className = "",
}) => {
  return (
    <div
      className={`absolute h-[2.25%] w-[42.29%] top-[19.22%] right-[30.38%] bottom-[78.53%] left-[30.32%] text-center text-sm text-gray-100 font-tt-firs-neue-trl ${className}`}
    >
      <div className="absolute h-[90%] w-[12.08%] top-[0%] right-[65.83%] bottom-[10%] left-[22.09%]">
        <img
          className="absolute h-[54.44%] w-[59.76%] top-[0%] right-[20.73%] bottom-[45.56%] left-[19.51%] max-w-full overflow-hidden max-h-full"
          alt=""
          src="/vuesaxlinearbuilding.svg"
        />
        <div className="absolute top-[64px] left-[0px] font-medium">
          Mini Flat
        </div>
      </div>
      <div className="absolute h-[90%] w-[15.46%] top-[0%] right-[41.97%] bottom-[10%] left-[42.56%]">
        <img
          className="absolute h-[54.44%] w-[46.67%] top-[0%] right-[27.62%] bottom-[45.56%] left-[25.71%] max-w-full overflow-hidden max-h-full"
          alt=""
          src="/vuesaxlinearbuildings2.svg"
        />
        <div className="absolute top-[64px] left-[0px] font-medium">
          2 Bedroom
        </div>
      </div>
      <div className="absolute h-[90%] w-[15.46%] top-[0%] right-[22.53%] bottom-[10%] left-[62%]">
        <img
          className="absolute h-[54.44%] w-[46.67%] top-[0%] right-[27.62%] bottom-[45.56%] left-[25.71%] max-w-full overflow-hidden max-h-full"
          alt=""
          src="/vuesaxlinearhouse.svg"
        />
        <div className="absolute top-[64px] left-[0px] font-medium">
          3 Bedroom
        </div>
      </div>
      <div className="absolute h-[90%] w-[17.67%] top-[0%] right-[0%] bottom-[10%] left-[82.33%]">
        <img
          className="absolute h-[54.44%] w-[40.83%] top-[0%] right-[29.17%] bottom-[45.56%] left-[30%] max-w-full overflow-hidden max-h-full"
          alt=""
          src="/vuesaxlinearhouse2.svg"
        />
        <div className="absolute top-[64px] left-[0px] font-medium">
          Single Room
        </div>
      </div>
      <div className="absolute h-full w-[9.72%] top-[0%] right-[90.28%] bottom-[0%] left-[0%] text-teal">
        <img
          className="absolute h-[49%] w-[74.24%] top-[0%] right-[12.12%] bottom-[51%] left-[13.64%] max-w-full overflow-hidden max-h-full"
          alt=""
          src="/vuesaxlinearbuildings.svg"
        />
        <div className="absolute top-[64px] left-[0px] font-medium">Duplex</div>
        <img
          className="absolute top-[100px] left-[9px] max-h-full w-[50px]"
          alt=""
          src="/vector-51.svg"
        />
      </div>
    </div>
  );
};

export default PropertyTypes;
