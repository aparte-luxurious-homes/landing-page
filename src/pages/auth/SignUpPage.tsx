
const SignUp = () => {
  return (
    <>

      <div className="flex justify-center items-center min-h-screen pt-16"> {/* Adjusted pt-24 to pt-16 to reduce top space */}
        {/* Container for the card */}
        <div className="w-full max-w-md bg-white shadow-md rounded-xl border border-solid border-black">
          {/* Placeholder for the header if needed */}
          <div className="mb-2">
            <h2 className="text-2xl font-semibold text-center">Login / Sign up</h2>
          </div>

          {/* Increased width of the divider to touch both sides */}
          <div className="border-t border-solid border-gray-300 w-full mb-6"></div>

          {/* Welcome Section */}
          <div className="mb-4 pl-8">
            <h3 className="text-md font-medium mb-3 pl-1 text-teal-500">Welcome to Aparte</h3> {/* Changed text size to smaller and color to teal */}
            
            {/* Email Input */}
            <input
              type="email"
              id="email"
              className="w-[93%] bg-white border border-gray-300 rounded-md p-4 mb-2 focus:outline-none focus:ring-2 focus:ring-teal-500"          placeholder="Email" 
            />

            {/* Info Text */}
            <p className="text-xs text-gray-500 mb-4">
              You’ll receive an OTP to verify your phone number. Standard messages and data rates may apply.
            </p>

            {/* Continue Button */}
            <button className="w-[93%] bg-teal-500 text-white rounded-lg py-3 hover:bg-teal-700 transition-colors">
              Continue
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center my-4 px-8">
            <div className="border-t border-solid border-gray-300 flex-1"></div> {/* Adjusted to flex-1 to fill space */}
            <span className="px-6  text-gray-500">or</span>
            <div className="border-t border-solid border-gray-300 flex-1"></div> {/* Adjusted to flex-1 to fill space */}
          </div>

          {/* Alternative Login Options */}
          <div className="space-y-3 mb-8 pl-8 mt-2">
            <button className="w-[93%] bg-white border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors">
              <img
                src="https://img.icons8.com/color/16/000000/google-logo.png"
                alt="Google Logo"
                className="mr-3"
              />
              <span className="flex-1 text-center">Continue with Google</span>
            </button>
            <button className="w-[93%] bg-white  border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors">
              <img
                src="https://img.icons8.com/ios-filled/16/000000/phone.png"
                alt="Phone Icon"
                className="mr-3" 
              />
              <span className="flex-1 text-center">Continue with Phone Number</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
