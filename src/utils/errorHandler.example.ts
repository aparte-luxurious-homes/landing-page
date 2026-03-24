/**
 * Example usage of the error handler utility
 * This file demonstrates how to use extractErrorMessage and extractAllErrorMessages
 * 
 * DO NOT import this file in production code - it's for documentation only
 */

import { extractErrorMessage, extractAllErrorMessages } from './errorHandler'

// ============================================================================
// Example 1: FastAPI Validation Error (Single Field)
// ============================================================================

const passwordValidationError = {
  status: 422,
  data: {
    detail: [
      {
        loc: ['body', 'password'],
        msg: 'Password must contain at least one special character',
        type: 'value_error',
      },
    ],
  },
}

console.log(extractErrorMessage(passwordValidationError, 'Signup failed'))
// Output: "Password: Password must contain at least one special character"

// ============================================================================
// Example 2: FastAPI Validation Error (Multiple Fields)
// ============================================================================

const multipleValidationErrors = {
  status: 422,
  data: {
    detail: [
      {
        loc: ['body', 'email'],
        msg: 'Invalid email format',
        type: 'value_error',
      },
      {
        loc: ['body', 'password'],
        msg: 'Password must be at least 8 characters',
        type: 'value_error',
      },
      {
        loc: ['body', 'phone'],
        msg: 'Phone number must be 10 digits',
        type: 'value_error',
      },
    ],
  },
}

console.log(extractErrorMessage(multipleValidationErrors, 'Signup failed'))
// Output: "Email: Invalid email format\nPassword: Password must be at least 8 characters\nPhone: Phone number must be 10 digits"

console.log(extractAllErrorMessages(multipleValidationErrors))
// Output: [
//   "Email: Invalid email format",
//   "Password: Password must be at least 8 characters",
//   "Phone: Phone number must be 10 digits"
// ]

// ============================================================================
// Example 3: Simple String Error
// ============================================================================

const simpleError = {
  status: 400,
  data: {
    detail: 'User with this email already exists',
  },
}

console.log(extractErrorMessage(simpleError, 'Signup failed'))
// Output: "User with this email already exists"

// ============================================================================
// Example 4: Custom Error Format
// ============================================================================

const customError = {
  status: 401,
  data: {
    errors: [{ message: 'Invalid credentials' }],
  },
}

console.log(extractErrorMessage(customError, 'Login failed'))
// Output: "Invalid credentials"

// ============================================================================
// Example 5: Direct Message
// ============================================================================

const directMessageError = {
  status: 500,
  data: {
    message: 'Internal server error',
  },
}

console.log(extractErrorMessage(directMessageError, 'Something went wrong'))
// Output: "Internal server error"

// ============================================================================
// Example 6: Unknown Error Format (Fallback)
// ============================================================================

const unknownError = {
  status: 500,
  data: {},
}

console.log(extractErrorMessage(unknownError, 'Something went wrong'))
// Output: "Something went wrong"

// ============================================================================
// Example 7: Usage in RTK Query Mutation
// ============================================================================

/*
import { extractErrorMessage } from '../utils/errorHandler';

const [signup] = useSignupMutation();

const handleSignup = async (data) => {
  try {
    await signup(data).unwrap();
    toast.success('Account created successfully!');
  } catch (err) {
    const errorMessage = extractErrorMessage(err, 'Failed to create account');
    toast.error(errorMessage);
  }
};
*/

// ============================================================================
// Example 8: Usage in RTK Query onQueryStarted
// ============================================================================

/*
import { extractErrorMessage } from '../utils/errorHandler';

export const authApi = createApi({
  // ...
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (credentials) => ({
        url: 'auth/signup',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success('Signup successful!');
        } catch (err) {
          const errorMessage = extractErrorMessage(err, 'Sign Up failed!');
          toast.error(errorMessage);
        }
      },
    }),
  }),
});
*/

// ============================================================================
// Example 9: Displaying Multiple Errors as Separate Toasts
// ============================================================================

/*
import { extractAllErrorMessages } from '../utils/errorHandler';

const handleSubmit = async (data) => {
  try {
    await signup(data).unwrap();
    toast.success('Account created!');
  } catch (err) {
    const errors = extractAllErrorMessages(err);
    
    if (errors.length > 1) {
      // Show each error as a separate toast
      errors.forEach(error => {
        toast.error(error, { autoClose: 5000 });
      });
    } else {
      // Single error
      toast.error(extractErrorMessage(err, 'Signup failed'));
    }
  }
};
*/

// ============================================================================
// Example 10: Displaying Multiple Errors in a List
// ============================================================================

/*
import { extractAllErrorMessages } from '../utils/errorHandler';

const [errors, setErrors] = useState<string[]>([]);

const handleSubmit = async (data) => {
  try {
    setErrors([]);
    await signup(data).unwrap();
    navigate('/verify-otp');
  } catch (err) {
    const errorMessages = extractAllErrorMessages(err);
    setErrors(errorMessages);
  }
};

// In JSX:
{errors.length > 0 && (
  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
    <ul className="list-disc list-inside space-y-1">
      {errors.map((error, index) => (
        <li key={index} className="text-red-700 text-sm">{error}</li>
      ))}
    </ul>
  </div>
)}
*/


