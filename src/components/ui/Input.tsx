import type React from "react"
import { forwardRef, type InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, fullWidth = false, className = "", disabled, ...props }, ref) => {
    const inputBaseStyles =
      "block rounded-md shadow-sm border-gray-300 focus:border-[#2369f4] focus:ring-[#2369f4] sm:text-sm bg-white text-gray-900"
    const widthStyles = fullWidth ? "w-full" : ""
    const errorStyles = error
      ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
      : ""
    const disabledStyles = disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""
    const iconStyles = leftIcon || rightIcon ? "pl-10" : ""

    return (
      <div className={`${widthStyles}`}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`${inputBaseStyles} ${widthStyles} ${errorStyles} ${disabledStyles} ${iconStyles} ${className}`}
            disabled={disabled}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  },
)

Input.displayName = "Input"

export default Input
