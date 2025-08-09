
// Used in various places to show error messages mainly in purchase success page
const ErrorDisplay = ({ message }) => {
    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-100 bg-opacity-70 backdrop-blur-sm"
            aria-labelledby="error-title"
            role="alertdialog"
            aria-modal="true"
        >
            <div className="flex flex-col items-center rounded-lg bg-white p-8 shadow-2xl ring-1 ring-red-200">
                {/* Error Icon */}
                <svg
                    className="h-12 w-12 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>

                {/* Text Content */}
                <h2 id="error-title" className="mt-6 text-xl font-semibold text-gray-800">
                    An Error Occurred
                </h2>
                <p className="mt-2 text-base text-red-600 bg-red-50 rounded-md px-4 py-2">
                    {message}
                </p>
            </div>
        </div>
    );
};
export default ErrorDisplay;