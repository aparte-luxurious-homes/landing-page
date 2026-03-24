/**
 * FastAPI Validation Error Structure
 */
interface FastAPIValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

/**
 * RTK Query Error Structure
 */
interface RTKQueryError {
  status?: number | string
  data?: {
    detail?: string | FastAPIValidationError[]
    errors?: { message: string }[]
    message?: string
  }
}

/**
 * Extracts a user-friendly error message from various error response formats
 * 
 * Handles:
 * 1. FastAPI validation errors: { detail: [{ loc, msg, type }] }
 * 2. Custom error responses: { errors: [{ message }] }
 * 3. Simple error responses: { detail: "error message" }
 * 4. Direct message: { message: "error message" }
 * 
 * @param err - The error object from RTK Query
 * @param fallbackMessage - Default message if no specific error is found
 * @returns User-friendly error message
 */
export const extractErrorMessage = (
  err: unknown,
  fallbackMessage: string = 'An error occurred'
): string => {
  const error = err as RTKQueryError

  // Check if error has data
  if (!error?.data) {
    return fallbackMessage
  }

  const { data } = error

  // Handle FastAPI validation errors (detail is an array of validation errors)
  if (Array.isArray(data.detail)) {
    const validationErrors = data.detail as FastAPIValidationError[]
    
    // Extract all validation error messages
    const errorMessages = validationErrors.map((validationError) => {
      // Get the field name from loc (e.g., ["body", "password"] -> "password")
      const fieldName = validationError.loc[validationError.loc.length - 1]
      const field = typeof fieldName === 'string' ? fieldName : 'field'
      
      // Return formatted message
      return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${validationError.msg}`
    })

    // Return all errors joined by newlines, or first error if only one
    return errorMessages.length === 1 
      ? errorMessages[0] 
      : errorMessages.join('\n')
  }

  // Handle simple string detail
  if (typeof data.detail === 'string') {
    return data.detail
  }

  // Handle custom error format with errors array
  if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors[0].message
  }

  // Handle direct message property
  if (data.message) {
    return data.message
  }

  // Fallback to default message
  return fallbackMessage
}

/**
 * Extracts all error messages from FastAPI validation errors
 * Useful when you want to display multiple errors
 * 
 * @param err - The error object from RTK Query
 * @returns Array of error messages
 */
export const extractAllErrorMessages = (err: unknown): string[] => {
  const error = err as RTKQueryError

  if (!error?.data) {
    return []
  }

  const { data } = error

  // Handle FastAPI validation errors
  if (Array.isArray(data.detail)) {
    const validationErrors = data.detail as FastAPIValidationError[]
    return validationErrors.map((validationError) => {
      const fieldName = validationError.loc[validationError.loc.length - 1]
      const field = typeof fieldName === 'string' ? fieldName : 'field'
      return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${validationError.msg}`
    })
  }

  // Handle other error formats
  const message = extractErrorMessage(err, '')
  return message ? [message] : []
}


