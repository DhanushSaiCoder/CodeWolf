import React, { useState } from 'react';
import "../styles/SignUp.css";
import codeWolf from '../images/codeWolf.jpg';

const SignUp = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
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

        // **Username Validation**
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required.';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters long.';
        }

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

        // **Confirm Password Validation**
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password.';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }

        return newErrors;
    };

    const handleSignUp = async (e) => {
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
                username: formData.username,
                email: formData.email,
                password: formData.password
            };
            console.log('sending request:', reqBody);
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reqBody),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    const errorText = data.message || data;

                    if (errorText.includes('Email already exists')) {
                        setErrors({ email: 'Email already exists.' });
                    } else {
                        setServerError(errorText);
                    }
                } else {
                    setServerError('An unexpected error occurred. Please try again.');
                }
                setIsLoading(false);
            } else {
                // **Successful Registration**
                console.log(data);
                localStorage.setItem('token', data.token)
                window.location.href = '/';
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setServerError('A network error occurred. Please check your internet connection.');
            setIsLoading(false);
        }
    };

    return (
        <div className='SignUp'>
            <div className='brandingDiv'>
                <img className='signupLogo' src={codeWolf} alt="logo" />
                <h1 className='signUpH1'>Code Wolf</h1>
                <p className='motto'><i>Every skilled coder must master fixing mistakes!</i></p>
            </div>

            <div className='signupFormDiv'>
                <h2>SIGN UP</h2>
                <form onSubmit={handleSignUp}>
                    {serverError && <div className="error server-error">{serverError}</div>}

                    {/* Username Field */}
                    <div className="inputGroup">
                        <input
                            autoComplete='off'
                            name="username"
                            className={`inputEle ${errors.username ? 'inputError' : ''}`}
                            type="text"
                            placeholder=" "
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <label htmlFor="username">Username</label>
                        {errors.username && <span className="error">{errors.username}</span>}
                    </div>

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

                    {/* Confirm Password Field */}
                    <div className="inputGroup">
                        <input
                            autoComplete='off'
                            name="confirmPassword"
                            className={`inputEle ${errors.confirmPassword ? 'inputError' : ''}`}
                            type="password"
                            placeholder=" "
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                    </div>

                    <i>
                        <p className='loginText'>
                            Already have an account? <a className="loginLink" href="/auth/login">Login</a>
                        </p>
                    </i>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            "Signing Up..."
                        ) : (
                            'Become a Wolf'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
