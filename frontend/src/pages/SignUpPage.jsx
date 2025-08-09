import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";

const SignUpPage = () => {
    // State to store form data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const { signup, loading } = useUserStore();

    // Function to handle form submission for signup
    const handleSubmit = (e) => {
        e.preventDefault();
        signup(formData);
    }

    return (
        <div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>

            {/* Create Account Heading */}
            {/* motiondiv allows animation such as fade in down of the heading */}
            <motion.div
                className='sm:mx-auto sm:w-full sm:max-w-md'
                initial={{ opacity: 0, y: -20 }} // initial opacity and position
                animate={{ opacity: 1, y: 0 }} // final opacity and position
                transition={{ duration: 0.8 }} // animation duration
            >
                <h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>Create your account</h2>
            </motion.div>

            {/* Signup Form */}
            {/* animation to fade in up the form */}
            <motion.div
                className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >

                <div className='bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10'>

                    {/* Form to submit user details */}
                    <form onSubmit={handleSubmit} className='space-y-6'>

                        {/* Full Name Label and Input */}
                        <div>
                            {/* Label */}
                            <label htmlFor='name' className='block text-sm font-medium text-gray-300'>
                                Full name
                            </label>
                            <div className='mt-1 relative rounded-md shadow-sm'>
                                {/* User icon */}
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <User className='h-5 w-5 text-gray-400' aria-hidden='true' />
                                </div>
                                {/* Input for full name */}
                                <input
                                    id='name'
                                    type='text'
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder='John Doe'
                                    className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm
									 placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
                                />
                            </div>
                        </div>

                        {/* Email Label and Input */}
                        <div>
                            {/* Label */}
                            <label htmlFor='email' className='block text-sm font-medium text-gray-300'>
                                Email address
                            </label>
                            <div className='mt-1 relative rounded-md shadow-sm'>
                                {/* Email Icon */}
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Mail className='h-5 w-5 text-gray-400' aria-hidden='true' />
                                </div>
                                {/* Input for email */}
                                <input
                                    id='email'
                                    type='email'
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder='you@example.com'
                                    className=' block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
									rounded-md shadow-sm
									 placeholder-gray-400 focus:outline-none focus:ring-emerald-500 
									 focus:border-emerald-500 sm:text-sm'
                                />
                            </div>
                        </div>

                        {/* Password Label and Input */}
                        <div>
                            {/* Label */}
                            <label htmlFor='password' className='block text-sm font-medium text-gray-300'>
                                Password
                            </label>
                            <div className='mt-1 relative rounded-md shadow-sm'>
                                {/* Lock Icon */}
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
                                </div>
                                {/* Input for password */}
                                <input
                                    id='password'
                                    type='password'
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder='••••••••'
                                    className=' block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
									rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
                                />
                            </div>
                        </div>

                        {/* Confirm Password Label and Input */}
                        <div>
                            {/* Label */}
                            <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-300'>
                                Confirm Password
                            </label>
                            <div className='mt-1 relative rounded-md shadow-sm'>
                                {/* Lock Icon */}
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
                                </div>
                                {/* Input for confirm password */}
                                <input
                                    id='confirmPassword'
                                    type='password'
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder='••••••••'
                                    className=' block w-full px-3 py-2 pl-10 bg-gray-700 border
									 border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
                                />
                            </div>
                        </div>

                        {/* Sign up button to submit form */}
                        <button
                            type='submit'
                            className='w-full flex justify-center py-2 px-4 border border-transparent 
							rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
							 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50'
                            disabled={loading}
                        >
                            {/* Show spinning loader and button is disabled if loading else show sign up button */}
                            {loading ? (
                                <>
                                    <Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <UserPlus className='mr-2 h-5 w-5' aria-hidden='true' />
                                    Sign up
                                </>
                            )}
                        </button>
                    </form>

                    {/* Link to login page with text if already have an account */}
                    <p className='mt-8 text-center text-sm text-gray-400'>
                        Already have an account?{" "}
                        <Link to='/login' className='font-medium text-emerald-400 hover:text-emerald-300'>
                            Login here <ArrowRight className='inline h-4 w-4' />
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default SignUpPage
