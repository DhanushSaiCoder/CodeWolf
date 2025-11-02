// Login.js

import React, { useState } from 'react';
import "../styles/Login.css";
import codeWolf from '../images/codeWolf.jpg';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear errors when the user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
        if (serverError) {
            setServerError('');
        }
    };

    const validate = () => {
        const newErrors = {};

        // **Email Validation**
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        // **Password Validation**
        if (!formData.password) {
            newErrors.password = 'Password is required.';
        }

        return newErrors;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsLoading(false);
            return;
        }

        try {
            const reqBody = {
                email: formData.email,
                password: formData.password,
            };
            console.log('Attempting to log in with:', reqBody);

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reqBody),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle specific server error messages
                if (response.status === 400) {
                    const errorText = data.message || data;

                    if (errorText === 'Email and password are required') {
                        setServerError('Email and password are required.');
                    } else if (errorText === 'Email or password is wrong' || errorText === 'Invalid password') {
                        setServerError('Invalid email or password.');
                    } else {
                        setServerError(errorText);
                    }
                } else {
                    setServerError('An unexpected error occurred. Please try again.');
                }
                setIsLoading(false);
            } else {
                // **Successful Login**
                console.log('Login successful:', data);

                // Store the token, e.g., in localStorage
                localStorage.setItem('token', data.token);

                // Redirect the user
                const queryParams = new URLSearchParams(window.location.search);
                const redirectUrl = queryParams.get('redirect');

                if (redirectUrl) {
                    window.location.href = redirectUrl;
                } else {
                    window.location.href = '/';
                }
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setServerError('A network error occurred. Please check your internet connection.');
            setIsLoading(false);
        }
    };

    return (
        <div className='Login'>
            <div className='brandingDiv'>
                <img className='loginLogo' src={codeWolf} alt="logo" />
                <h1 className='loginH1'>Code Wolf</h1>
                <p className='motto'><i>Every skilled coder must master fixing mistakes!</i></p>
            </div>

            <div className='loginFormDiv'>
                <h2>LOGIN</h2>
                <form onSubmit={handleLogin}>
                    {serverError && <div className="error server-error">{serverError}</div>}

                    {/* Email Field */}
                    <div className="inputGroup">
                        <input
                            autoComplete='off'
                            name="email"
                            className={`inputEle ${errors.email ? 'inputError' : ''}`}
                            type="email"
                            placeholder=" "
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <label htmlFor="email">Email</label>
                        {errors.email && <span className="error">{errors.email}</span>}
                    </div>

                    {/* Password Field */}
                    <div className="inputGroup">
                        <input
                            autoComplete='off'
                            name="password"
                            className={`inputEle ${errors.password ? 'inputError' : ''}`}
                            type="password"
                            placeholder=" "
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <label htmlFor="password">Password</label>
                        {errors.password && <span className="error">{errors.password}</span>}
                    </div>

                    <i>
                        <p className='signupText'>
                            Don't have an account? <a className="signupLink" href="/auth/signup">Sign Up</a>
                        </p>
                    </i>
                    <button className='logInBtn' type="submit" disabled={isLoading}>
                        {isLoading ? (
                            "Logging In..."
                        ) : (
                            'Enter the Den'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
