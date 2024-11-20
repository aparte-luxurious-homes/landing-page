// Login.tsx



const Login = () => {
return (
    <>
      <div className="flex justify-center items-center min-h-screen pt-12">
        <div className="w-full max-w-md bg-white shadow-md rounded-xl border border-solid border-black">
          <div className="mb-1">
            <h2 className="text-xl font-semibold text-center">Login / Sign up</h2>
          </div>

          <div className="border-t border-solid border-gray-300 w-full mb-4"></div>

            <div className="mb-4 px-6">
               <h3 className="text-md font-medium mb-3 pl-3 text-teal-500">Welcome to Aparte</h3>

                <div className="mb-4">
                    <div className="relative w-[95%] ml-3 border border-solid border-black rounded-lg bg-white focus-within:ring-2 focus-within:ring-teal-500">
                        {/* Country / Region Section */}
                            <div className="flex flex-col p-2">
                                    <div className="pl-4">
                                    <label htmlFor="country" className="block text-[9px] text-gray-500 ml-1">
                                        Country / Region
                                    </label>
                                    <select
                                        id="country"
                                        className=" custom-select appearance-none bg-transparent font-semibold text-gray-700 focus:outline-none w-full"
                                    >
                                        <option>Nigeria (+234)</option>
                                        <option>Kenya (+254)</option>
                                        <option>Ghana (+233)</option>
                                    </select>
                                    </div>
                            
                            {/* Dropdown Icon */}
                            <div className="absolute right-8 top-3 pointer-events-none">
                                <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                >
                                <path
                                    d="M19.9201 8.94922L13.4001 15.4692C12.6301 16.2392 11.3701 16.2392 10.6001 15.4692L4.08008 8.94922"
                                    stroke="#292D32"
                                    strokeWidth="1.5"
                                    strokeMiterlimit="10"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                </svg>
                            </div>
                            </div>

                            {/* Horizontal Divider */}
                            <div className="border-t border-solid border-black"></div>

                            {/* Phone Number Section */}
                            <div className="flex flex-row items-center space-x-2 p-3 pl-6">
                                <label htmlFor="phone" className="text-sm text-gray-400">
                                    Phone Number
                                </label>
                                 
                                 {/* Vertical Divider */}
                                    <div className="h-4 w-px bg-gray-700"></div> {/* Thin vertical line */}

                                <input
                                    type="tel"
                                    id="phone"
                                    className="flex-1 bg-transparent text-gray-700 focus:outline-none pl-4 placeholder-gray-300"
                                    placeholder="080 X XXXX XXX"
                                />
                            </div>

                        </div>
                        </div>

                

                    <p className="text-[10px] font-semibold text-gray-500 mb-2 px-4">
                            You’ll receive an OTP to verify your phone number. Standard messages and data rates may apply.
                    </p>

                 <button className="w-[95%] bg-teal-500 text-white rounded-lg py-3 ml-3 hover:bg-teal-700 transition-colors">
                    Continue
                </button>
            </div>

            <div className="flex items-center justify-center my-4 px-8">
            <div className="border-t border-solid border-gray-300 flex-1"></div> {/* Adjusted to flex-1 to fill space */}
            <span className="px-6  text-gray-500">or</span>
            <div className="border-t border-solid border-gray-300 flex-1"></div> {/* Adjusted to flex-1 to fill space */}
            </div>
              
            <div className="space-y-3 mb-8 pl-8 mt-2">
            <button className="w-[93%] bg-white border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors">
              <img
                src="https://img.icons8.com/color/16/000000/google-logo.png"
                alt="Google Logo"
                className="ml-3 h-3 w-3"
              />
              <span className="flex-1 text-center">Continue with Google</span>
            </button>
            <button className="w-[93%] bg-white  border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors">
              <img
                src="/email.png"
                alt="Phone Icon"
                className="ml-3 h-3 w-3" 
              />
              <span className="flex-1 text-center">Continue with Email</span>
            </button>
          </div>



          </div>
        </div>
    </>
  );
};

export default Login;
