"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SignInSignUp() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mobileOnboardingStep, setMobileOnboardingStep] = useState(0)
  const [showLoginForm, setShowLoginForm] = useState(false)

  // Slides data
  const slides = [
    {
      type: "image",
      image: "/onboard-animation-1.png",
      title: "Save anything that catches your eye",
      description: "Links, social posts, images, and more all in one place",
    },
    {
      type: "image",
      image: "/onboard-animation-2.png",
      title: "Let AI do the organizing",
      description: "Automatic summaries, tags, and categorisation without the effort",
    },
    {
      type: "image",
      image: "/onboard-animation-3.png",
      title: "Rediscover at the perfect moment",
      description: "Loft surfaces what you need, when you need it.",
    },
  ]

  // Auto-rotate slides on desktop
  useEffect(() => {
    // Only auto-rotate on desktop
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [slides.length])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Navigate to the interest page on login
    router.push("/bookmarks")
  }

  const handleGetStartedClick = () => {
    if (mobileOnboardingStep < slides.length - 1) {
      // Move to next onboarding step
      setMobileOnboardingStep(mobileOnboardingStep + 1)
    } else {
      // Show login form after all slides are shown
      setShowLoginForm(true)
    }
  }

  // Logo component to ensure consistency
  const Logo = ({ size = "normal" }) => (
    <div className={`flex items-center text-blue-500 ${size === "large" ? "text-5xl" : "text-2xl"} font-semibold`}>
      <img src="/logo.png" alt="InShort Logo" className={size === "large" ? "h-12" : "h-8"} />
    </div>
  )

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Mobile Onboarding View */}
      <div
        className={`w-full h-full md:hidden ${showLoginForm ? "hidden" : "block"} bg-gradient-to-b from-[#e6f2f8] to-[#d9eaf3]`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile view layout with reduced spacing and no top logo */}
          <div className="flex flex-col h-full pt-4">
            {/* Current slide image */}
            <div className="flex-grow flex items-center justify-center p-4 pb-2 pt-8">
              {slides[mobileOnboardingStep].type === "logo" ? (
                // First slide with circular pattern and InShort logo
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-72 h-72 rounded-full bg-blue-400/20 flex items-center justify-center">
                      <div className="w-60 h-60 rounded-full bg-blue-400/20 flex items-center justify-center">
                        <div className="w-48 h-48 rounded-full bg-blue-400/20 flex items-center justify-center">
                          <Logo size="large" />
                        </div>
                      </div>
                    </div>
                    {/* Small dots around the circle */}
                    <div className="absolute top-0 left-1/2 w-3 h-3 bg-blue-300 rounded-full transform -translate-x-1/2 -translate-y-6"></div>
                    <div className="absolute top-1/4 right-0 w-3 h-3 bg-blue-300 rounded-full transform translate-x-6"></div>
                    <div className="absolute bottom-1/4 right-0 w-3 h-3 bg-blue-300 rounded-full transform translate-x-6"></div>
                    <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-blue-300 rounded-full transform -translate-x-1/2 translate-y-6"></div>
                    <div className="absolute bottom-1/4 left-0 w-3 h-3 bg-blue-300 rounded-full transform -translate-x-6"></div>
                    <div className="absolute top-1/4 left-0 w-3 h-3 bg-blue-300 rounded-full transform -translate-x-6"></div>
                  </div>
                </div>
              ) : (
                // Image slides - Using contain to show full image
                <div className="w-full h-72 sm:h-96 flex items-center justify-center">
                  <img
                    src={slides[mobileOnboardingStep].image || "/placeholder.svg"}
                    alt="Onboarding illustration"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Slide text with reduced spacing */}
            <div className="px-6 text-center">
              <h2 className="text-2xl font-bold mb-2">{slides[mobileOnboardingStep].title}</h2>
              <p className="text-gray-600 mb-6">{slides[mobileOnboardingStep].description}</p>

              {/* Progress indicators - same size dots with color change only */}
              <div className="flex justify-center space-x-2 mb-6">
                {slides.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full ${index === mobileOnboardingStep ? "bg-blue-500" : "bg-gray-300"}`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Button at bottom */}
            <div className="p-6 pt-2 mt-auto">
              <button
                onClick={handleGetStartedClick}
                className="w-full bg-[#2F80ED] text-white py-4 px-4 rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition text-lg font-medium"
              >
                {mobileOnboardingStep === slides.length - 1 ? "Get Started" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Login Form (shown after onboarding) */}
      <div className={`w-full h-full md:hidden ${showLoginForm ? "block" : "hidden"} bg-[#e6f2f8] p-6`}>
        <div className="flex flex-col h-full">
          <div className="mb-6">
            <Logo />
          </div>

          <div className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-md">
              <h1 className="text-3xl font-bold text-center mb-2">Log In</h1>
              <p className="text-center text-gray-600 mb-8">
                Don't have an account?{" "}
                <Link href="#" className="text-blue-500 hover:underline">
                  Sign Up
                </Link>
              </p>

              <div className="space-y-4">
                <button className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>

                <button className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continue with Facebook
                </button>

                <div className="flex items-center justify-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="px-4 text-gray-500 text-sm">Or</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Loisbecket@gmail.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="********"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center rounded-2xl"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                          Remember me
                        </label>
                      </div>
                      <div className="text-sm">
                        <Link href="#" className="text-blue-500 hover:underline">
                          Forgot Password ?
                        </Link>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#2F80ED] text-white py-3 px-4 rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                    >
                      Log In
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View - Left side (Login Form) */}
      <div className="hidden md:block md:w-1/2 bg-[#e6f2f8] relative">
        {/* Logo positioned at the top left */}
        <div className="absolute top-10 left-10">
          <Logo />
        </div>

        {/* Centered content */}
        <div className="flex items-center justify-center h-full">
          <div className="max-w-md w-full px-10">
            <h1 className="text-3xl font-bold text-center mb-2">Log In</h1>
            <p className="text-center text-gray-600 mb-8">
              Don't have an account?{" "}
              <Link href="#" className="text-blue-500 hover:underline">
                Sign Up
              </Link>
            </p>

            <div className="space-y-4">
              <button className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>

              <button className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </button>

              <div className="flex items-center justify-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">Or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="desktop-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="desktop-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Loisbecket@gmail.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="desktop-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="desktop-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="********"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center rounded-2xl"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="desktop-remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="desktop-remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <div className="text-sm">
                      <Link href="#" className="text-blue-500 hover:underline">
                        Forgot Password ?
                      </Link>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#2F80ED] text-white py-3 px-4 rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                  >
                    Log In
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View - Right side (Slider) */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-b from-[#e6f2f8] to-[#d9eaf3] relative overflow-hidden">
        {/* Slides */}
        <div className="absolute inset-0 flex items-center justify-center">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${
                currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {slide.type === "logo" ? (
                // First slide with circular pattern and InShort logo
                <div className="flex flex-col items-center justify-center">
                  <div className="relative mb-8">
                    <div className="w-80 h-80 rounded-full bg-blue-400/20 flex items-center justify-center">
                      <div className="w-68 h-68 rounded-full bg-blue-400/20 flex items-center justify-center">
                        <div className="w-56 h-56 rounded-full bg-blue-400/20 flex items-center justify-center">
                          <Logo size="large" />
                        </div>
                      </div>
                    </div>
                    {/* Small dots around the circle */}
                    <div className="absolute top-0 left-1/2 w-4 h-4 bg-blue-300 rounded-full transform -translate-x-1/2 -translate-y-8"></div>
                    <div className="absolute top-1/4 right-0 w-4 h-4 bg-blue-300 rounded-full transform translate-x-8"></div>
                    <div className="absolute bottom-1/4 right-0 w-4 h-4 bg-blue-300 rounded-full transform translate-x-8"></div>
                    <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-blue-300 rounded-full transform -translate-x-1/2 translate-y-8"></div>
                    <div className="absolute bottom-1/4 left-0 w-4 h-4 bg-blue-300 rounded-full transform -translate-x-8"></div>
                    <div className="absolute top-1/4 left-0 w-4 h-4 bg-blue-300 rounded-full transform -translate-x-8"></div>
                  </div>
                  <div className="text-center px-8">
                    <h2 className="text-3xl font-bold mb-4">{slide.title}</h2>
                    <p className="text-xl text-gray-600">{slide.description}</p>
                  </div>
                </div>
              ) : (
                // Image slides with text - Using contain to show full image
                <div className="flex flex-col items-center justify-center w-full h-full px-8">
                  <div className="h-96 flex items-center justify-center mb-8">
                    <img
                      src={slide.image || "/placeholder.svg"}
                      alt="Onboarding illustration"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">{slide.title}</h2>
                    <p className="text-xl text-gray-600">{slide.description}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full focus:outline-none ${
                index === currentSlide ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  )
}
