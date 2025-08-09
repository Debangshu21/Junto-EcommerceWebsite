
// Used in various places to show processing loader mainly in purchase success page
const ProcessingLoader = () => {
    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-800 bg-opacity-60 backdrop-blur-sm"
            aria-labelledby="loading-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="flex flex-col items-center rounded-lg bg-white p-8 shadow-2xl">
                {/* SVG Spinner */}
                <svg
                    className="h-12 w-12 animate-spin text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>

                {/* Text Content */}
                <h2 id="loading-title" className="mt-6 text-xl font-semibold text-gray-800">
                    Processing...
                </h2>
                <p className="mt-2 text-base text-gray-600">
                    Please wait, we're working on it.
                </p>
            </div>
        </div>
    );
};
export default ProcessingLoader;