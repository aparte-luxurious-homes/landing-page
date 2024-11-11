import { FunctionComponent, useCallback } from "react";
import GroupComponent1 from "../components/GroupComponent1";
import SearchBar from "../components/SearchBar";
import GroupComponent from "../components/GroupComponent";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyTypes from "../components/PropertyTypes";

const LandingPage: FunctionComponent = () => {
  const onGroupContainerClick = useCallback(() => {
    // Please sync "Apartment Page" to the project
  }, []);

  return (
    <div className="w-full relative bg-other-white h-[4448px] overflow-hidden text-left text-11xl text-other-white font-tt-firs-neue-trl">
      <div className="absolute top-[3535px] left-[0px] bg-teal w-[1728px] h-[503px]" />
      <Header />
      <GroupComponent1 />
      <SearchBar property1="Default" />
      <div className="absolute top-[995px] left-[100px] text-16xl font-medium text-gray-200">
        Guest Favorites
      </div>
      <div className="absolute top-[1600px] left-[100px] text-16xl font-medium text-gray-200">
        Apartments in Lagos, Nigeria
      </div>
      <img
        className="absolute h-[0.56%] w-[1.62%] top-[22.55%] right-[76.1%] bottom-[70.89%] left-[26.28%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearheart.svg"
      />
      <img
        className="absolute top-[1080px] left-[490px] w-[359px] h-[450px] object-cover"
        alt=""
        src="/mask-group1@2x.png"
      />
      <img
        className="absolute top-[1080px] left-[879px] w-[359px] h-[450px] object-cover"
        alt=""
        src="/mask-group2@2x.png"
      />
      <img
        className="absolute top-[1080px] left-[1269px] w-[359px] h-[450px] object-cover"
        alt=""
        src="/mask-group3@2x.png"
      />
      <div className="absolute top-[1387px] left-[490px] rounded-t-none rounded-b-11xl [background:linear-gradient(180.37deg,_rgba(0,_0,_0,_0)_33.78%,_#000)] w-[359px] h-[143px]" />
      <div className="absolute top-[1387px] left-[879px] rounded-t-none rounded-b-11xl [background:linear-gradient(180.37deg,_rgba(0,_0,_0,_0)_33.78%,_#000)] w-[359px] h-[143px]" />
      <div className="absolute top-[1387px] left-[1269px] rounded-t-none rounded-b-11xl [background:linear-gradient(180.37deg,_rgba(0,_0,_0,_0)_33.78%,_#000)] w-[359px] h-[143px]" />
      <div className="absolute top-[1410px] left-[520px] leading-[94%] inline-block w-[299px]">
        The Central Park Hotel
      </div>
      <div className="absolute top-[1410px] left-[909px] leading-[94%] inline-block w-[299px]">
        Water Front Classic Suites
      </div>
      <div className="absolute top-[1410px] left-[1299px] leading-[94%] inline-block w-[299px]">
        The Yellow Base Apartments
      </div>
      <div className="absolute top-[1476px] left-[922px] text-smi-1 leading-[94%] font-medium inline-block w-[121px]">
        Ajah, Lagos Nigeria
      </div>
      <div className="absolute top-[1476px] left-[1312px] text-smi-1 leading-[94%] font-medium inline-block w-[121px]">
        Garki, Abuja Nigeria
      </div>
      <div className="absolute top-[1476px] left-[520px] w-[299px] h-[11px] text-smi-1">
        <div className="absolute top-[0px] left-[13px] leading-[94%] font-medium inline-block w-[286px]">
          Ibadan, Oyo Nigeria
        </div>
        <img
          className="absolute h-[84.55%] w-[2.68%] top-[0%] right-[97.32%] bottom-[15.45%] left-[0%] max-w-full overflow-hidden max-h-full"
          alt=""
          src="/vuesaxlinearlocation.svg"
        />
      </div>
      <img
        className="absolute h-[0.21%] w-[0.46%] top-[33.18%] right-[46.93%] bottom-[66.61%] left-[52.6%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearlocation.svg"
      />
      <img
        className="absolute h-[0.21%] w-[0.46%] top-[33.18%] right-[24.36%] bottom-[66.61%] left-[75.17%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearlocation.svg"
      />
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[68.91%] bottom-[74.73%] left-[30.09%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar.svg"
      />
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[46.39%] bottom-[74.73%] left-[52.6%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar.svg"
      />
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[23.83%] bottom-[74.73%] left-[75.17%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar.svg"
      />
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[67.67%] bottom-[74.73%] left-[31.33%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar1.svg"
      />
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[45.16%] bottom-[74.73%] left-[53.84%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar1.svg"
      />
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[22.59%] bottom-[74.73%] left-[76.41%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar1.svg"
      />
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[66.43%] bottom-[74.73%] left-[32.57%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar2.svg"
      />
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[43.92%] bottom-[74.73%] left-[55.08%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar2.svg"
      />
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[21.35%] bottom-[74.73%] left-[77.65%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar2.svg"
      />
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[65.19%] bottom-[74.73%] left-[33.81%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar3.svg"
      />
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[42.67%] bottom-[74.73%] left-[56.33%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar3.svg"
      />
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[20.1%] bottom-[74.73%] left-[78.89%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar3.svg"
      />
      <div className="absolute top-[1080px] left-[100px] w-[359px] h-[450px]">
        <div className="absolute top-[0px] left-[0px] w-[359px] h-[450px]">
          <img
            className="absolute top-[0px] left-[0px] w-[359px] h-[450px] object-cover"
            alt=""
            src="/mask-group4@2x.png"
          />
          <div className="absolute top-[307px] left-[0px] w-[359px] h-[143px]">
            <div className="absolute top-[0px] left-[0px] rounded-t-none rounded-b-11xl [background:linear-gradient(180.37deg,_rgba(0,_0,_0,_0)_33.78%,_#000)] w-[359px] h-[143px]" />
            <div className="absolute top-[23px] left-[30px] w-[299px] h-[77px]">
              <div className="absolute top-[0px] left-[0px] leading-[94%] inline-block w-[299px]">
                Apartments De Grande
              </div>
              <div className="absolute top-[66px] left-[0px] w-[299px] h-[11px] text-smi-1">
                <div className="absolute top-[0px] left-[13px] leading-[94%] font-medium inline-block w-[286px]">
                  Lekki, Lagos Nigeria
                </div>
                <img
                  className="absolute h-[84.55%] w-[2.68%] top-[0%] right-[97.32%] bottom-[15.45%] left-[0%] max-w-full overflow-hidden max-h-full"
                  alt=""
                  src="/vuesaxlinearlocation.svg"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute h-[3.82%] w-[28.69%] top-[6%] right-[62.95%] bottom-[90.18%] left-[8.36%]">
          <img
            className="absolute h-full w-[16.8%] top-[0%] right-[83.2%] bottom-[0%] left-[0%] max-w-full overflow-hidden max-h-full"
            alt=""
            src="/vuesaxlinearstar.svg"
          />
          <img
            className="absolute h-full w-[16.8%] top-[0%] right-[62.43%] bottom-[0%] left-[20.78%] max-w-full overflow-hidden max-h-full"
            alt=""
            src="/vuesaxlinearstar1.svg"
          />
          <img
            className="absolute h-full w-[16.8%] top-[0%] right-[41.65%] bottom-[0%] left-[41.55%] max-w-full overflow-hidden max-h-full"
            alt=""
            src="/vuesaxlinearstar2.svg"
          />
          <img
            className="absolute h-full w-[16.8%] top-[0%] right-[20.78%] bottom-[0%] left-[62.43%] max-w-full overflow-hidden max-h-full"
            alt=""
            src="/vuesaxlinearstar3.svg"
          />
          <img
            className="absolute h-full w-[16.8%] top-[0%] right-[0%] bottom-[0%] left-[83.2%] max-w-full overflow-hidden max-h-full"
            alt=""
            src="/vuesaxlinearstar4.svg"
          />
        </div>
      </div>
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[63.95%] bottom-[74.73%] left-[35.05%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar4.svg"
      />
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[41.44%] bottom-[74.73%] left-[57.56%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar4.svg"
      />
      <img
        className="absolute h-[0.39%] w-[1%] top-[24.89%] right-[18.87%] bottom-[74.73%] left-[80.13%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vuesaxlinearstar4.svg"
      />

      <GroupComponent
        onGroupContainerClick={onGroupContainerClick}
        maskGroup="/mask-group5@2x.png"
        vuesaxlinearstar4="/vuesaxlinearstar9.svg"
      />
      <GroupComponent
        groupDivTop="2253px"
        onGroupContainerClick={onGroupContainerClick}
        groupDivLeft="100px"
        maskGroup="/mask-group5@2x.png"
        vuesaxlinearstar4="/vuesaxlinearstar9.svg"
      />
      <GroupComponent
        groupDivTop="2821px"
        onGroupContainerClick={onGroupContainerClick}
        groupDivLeft="100px"
        maskGroup="/mask-group5@2x.png"
        vuesaxlinearstar4="/vuesaxlinearstar9.svg"
      />
      <GroupComponent
        groupDivTop="1685px"
        groupDivLeft="490px"
        maskGroup="/mask-group5@2x.png"
        vuesaxlinearstar4="/vuesaxlinearstar10.svg"
      />
      <GroupComponent
        groupDivTop="2253px"
        groupDivLeft="490px"
        maskGroup="/mask-group5@2x.png"
        vuesaxlinearstar4="/vuesaxlinearstar10.svg"
      />
      <GroupComponent
        groupDivTop="2821px"
        groupDivLeft="490px"
        maskGroup="/mask-group5@2x.png"
        vuesaxlinearstar4="/vuesaxlinearstar10.svg"
      />
      <GroupComponent
        groupDivTop="1685px"
        groupDivLeft="880px"
        maskGroup="/mask-group5@2x.png"
        vuesaxlinearstar4="/vuesaxlinearstar10.svg"
      />
      <GroupComponent
        groupDivTop="2253px"
        groupDivLeft="880px"
        maskGroup="/mask-group5@2x.png"
        vuesaxlinearstar4="/vuesaxlinearstar10.svg"
      />
      <GroupComponent
        groupDivTop="2821px"
        groupDivLeft="880px"
        maskGroup="/mask-group5@2x.png"
        vuesaxlinearstar4="/vuesaxlinearstar10.svg"
      />
      <GroupComponent
        groupDivTop="1685px"
        groupDivLeft="1270px"
        maskGroup="/mask-group5@2x.png"
        vuesaxlinearstar4="/vuesaxlinearstar10.svg"
      />
      <GroupComponent
        groupDivTop="2253px"
        groupDivLeft="1270px"
        maskGroup="/mask-group5@2x.png"
        vuesaxlinearstar4="/vuesaxlinearstar10.svg"
      />
      <GroupComponent
        groupDivTop="2821px"
        groupDivLeft="1270px"
        maskGroup="/mask-group5@2x.png"
        vuesaxlinearstar4="/vuesaxlinearstar10.svg"
      />
      
      <div className="absolute top-[3679px] left-[85px] text-[35px] font-medium">
        Are You an Agent or Home Owner?
      </div>
      <div className="absolute top-[3655px] left-[700px] rounded-3xs bg-other-white w-[400px] h-[80px]" />
      <div className="absolute top-[3680px] left-[800px] font-medium text-teal">
        Become a Partner
      </div>
      <Footer />
      <div className="absolute top-[3403px] left-[340px] w-[646px] h-[46px] text-center text-xl text-gray-100">
        <div className="absolute top-[0px] left-[0px] w-[646px] h-[46px]">
          <img
            className="absolute top-[0px] left-[0px] w-[46px] h-[46px]"
            alt=""
            src="/group-87.svg"
          />
          <img
            className="absolute top-[0px] left-[600px] w-[46px] h-[46px] object-contain"
            alt=""
            src="/group-88@2x.png"
          />
        </div>
        <div className="absolute top-[10px] left-[106px] w-[434px] h-[26px]">
          <b className="absolute top-[0px] left-[0px] text-gray-200">1</b>
          <div className="absolute top-[0px] left-[78px] font-medium">2</div>
          <div className="absolute top-[0px] left-[160px] font-medium">3</div>
          <div className="absolute top-[0px] left-[243px] font-medium">4</div>
          <div className="absolute top-[0px] left-[410px] font-medium">25</div>
          <div className="absolute top-[0px] left-[325px] font-medium">...</div>
        </div>
      </div>
      <div className="absolute top-[1275px] left-[130px] w-[299px] h-11">
        <img
          className="absolute top-[0px] left-[0px] w-11 h-11"
          alt=""
          src="/group-96.svg"
        />
        <img
          className="absolute top-[0px] left-[255px] w-11 h-11 object-contain"
          alt=""
          src="/group-97@2x.png"
        />
      </div>
      <div className="absolute top-[1275px] left-[520px] w-[299px] h-11">
        <img
          className="absolute top-[0px] left-[0px] w-11 h-11"
          alt=""
          src="/group-96.svg"
        />
        <img
          className="absolute top-[0px] left-[255px] w-11 h-11 object-contain"
          alt=""
          src="/group-97@2x.png"
        />
      </div>
      <div className="absolute top-[1275px] left-[909px] w-[299px] h-11">
        <img
          className="absolute top-[0px] left-[0px] w-11 h-11"
          alt=""
          src="/group-96.svg"
        />
        <img
          className="absolute top-[0px] left-[255px] w-11 h-11 object-contain"
          alt=""
          src="/group-97@2x.png"
        />
      </div>
      <div className="absolute top-[1275px] left-[1299px] w-[299px] h-11">
        <img
          className="absolute top-[0px] left-[0px] w-11 h-11"
          alt=""
          src="/group-96.svg"
        />
        <img
          className="absolute top-[0px] left-[255px] w-11 h-11 object-contain"
          alt=""
          src="/group-97@2x.png"
        />
      </div>
      <PropertyTypes />
    </div>
  );
};

export default LandingPage;
