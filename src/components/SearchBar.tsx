import { FunctionComponent } from "react";

export type SearchBarType = {
  className?: string;

  /** Variant props */
  property1?: "Default";
};

const SearchBar: FunctionComponent<SearchBarType> = ({
  className = "",
  property1 = "Default",
}) => {
  return (
    <div
      className={`absolute top-[675px] left-[calc(72%_-_650px)] w-[800px] h-[103px] text-left text-sm text-gray-200 font-tt-firs-neue-trl ${className}`}
      data-property1={property1}
    >
      <div className="absolute h-[103.88%] w-[100.33%] top-[-1.94%] right-[-0.17%] bottom-[-1.94%] left-[-0.17%] shadow-[0px_0px_50.4px_8px_rgba(0,_0,_0,_0.04)] rounded-181xl bg-other-white border-teal border-[2px] border-solid box-border" />
      <img
        className="absolute h-[48.54%] w-[0.08%] top-[26.21%] right-[79%] bottom-[25.24%] left-[20.92%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vector-5.svg"
      />
      <img
        className="absolute h-[48.54%] w-[0.08%] top-[26.21%] right-[63.33%] bottom-[25.24%] left-[36.58%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vector-5.svg"
      />
      <img
        className="absolute h-[48.54%] w-[0.08%] top-[26.21%] right-[47.67%] bottom-[25.24%] left-[52.25%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vector-5.svg"
      />
      <img
        className="absolute h-[48.54%] w-[0.08%] top-[26.21%] right-[28.67%] bottom-[25.24%] left-[71.25%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vector-5.svg"
      />
      <div className="absolute h-full w-[20.92%] top-[0%] right-[79.08%] bottom-[0%] left-[0%] rounded-tl-81xl rounded-tr-none rounded-br-none rounded-bl-81xl bg-whitesmoke-100" />
      <div className="absolute h-[39.81%] w-[7.33%] top-[30.1%] right-[67.58%] bottom-[30.1%] left-[25.08%]">
        <div className="absolute top-[0%] left-[0%] font-medium">Check in</div>
        <div className="absolute top-[48.78%] left-[0%] text-base font-medium text-gray-100">
          Select date
        </div>
      </div>
      <div className="absolute h-[39.81%] w-[12.58%] top-[30.1%] right-[83.25%] bottom-[30.1%] left-[4.17%]">
        <div className="absolute top-[0%] left-[0%] font-medium">Location</div>
        <div className="absolute top-[48.78%] left-[0%] text-base font-medium text-gray-100">
          Search destinations
        </div>
      </div>
      <div className="absolute h-[39.81%] w-[7.33%] top-[30.1%] right-[51.92%] bottom-[30.1%] left-[40.75%]">
        <div className="absolute top-[0%] left-[0%] font-medium">Check out</div>
        <div className="absolute top-[48.78%] left-[0%] text-base font-medium text-gray-100">
          Select date
        </div>
      </div>
      <div className="absolute h-[39.81%] w-[10.67%] top-[30.1%] right-[32.92%] bottom-[30.1%] left-[56.42%]">
        <div className="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%]">
          <div className="absolute top-[0%] left-[0%] font-medium">
            Property
          </div>
          <div className="absolute top-[48.78%] left-[0%] text-base font-medium text-gray-100">
            Choose property
          </div>
        </div>
      </div>
      <div className="absolute h-[39.81%] w-[7.5%] top-[30.1%] right-[17.08%] bottom-[30.1%] left-[75.42%]">
        <div className="absolute top-[0%] left-[0%] font-medium">Guests</div>
        <div className="absolute top-[48.78%] left-[0%] text-base font-medium text-gray-100">
          Add Guests
        </div>
      </div>
      <img
        className="absolute h-[78.64%] w-[6.75%] top-[10.68%] right-[0.92%] bottom-[10.68%] left-[92.33%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/search-button.svg"
      />
    </div>
  );
};

export default SearchBar;
