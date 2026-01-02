"use client"

import { useRouter } from "next/navigation"
import { FiAlertTriangle, FiHome } from "react-icons/fi"

export default function BannedPage() {
  const router = useRouter()

  const handleGoHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full">
              <FiAlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Account Suspended</h1>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Your account has been temporarily suspended due to a violation of our terms of service. If you believe this
            is an error, please contact our support team.
          </p>


          {/* Go Home Button */}
          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <FiHome className="h-5 w-5" />
            Go to Home
          </button>
        </div>
      </div>
    </div>
  )
}
