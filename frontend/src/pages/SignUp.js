import React from 'react';
import "../styles/SignUp.css";
import codeWolf from '../images/codeWolf.jpg';
import Login from './Login';

const SignUp = () => {
    return (
        <div className='SignUp'>
            <div className='brandingDiv'>
                <img className='signupLogo' src={codeWolf} alt="logo" />
                <h1 className='signUpH1'>Code Wolf</h1>
                <p className='motto'><i>Every skilled coder must master fixing mistakes!</i></p>
            </div>

            <div className='signupFormDiv'>
                <h2>SIGN UP</h2>
                <form>
                    <div className="inputGroup">
                        <input
                            autoComplete='off'
                            id="username"
                            className='inputEle'
                            type="text"
                            placeholder=" "
                        />
                        <label htmlFor="username">Username</label>
                    </div>

                    <div className="inputGroup">
                        <input
                            autoComplete='off'

                            id="email"
                            className='inputEle'
                            type="email"
                            placeholder=" "
                        />
                        <label htmlFor="email">Email</label>
                    </div>

                    <div className="inputGroup">
                        <input
                            autoComplete='off'

                            id="password"
                            className='inputEle'
                            type="password"
                            placeholder=" "
                        />
                        <label htmlFor="password">Password</label>
                    </div>

                    <div className="inputGroup">
                        <input
                            autoComplete='off'

                            id="confirmPassword"
                            className='inputEle'
                            type="password"
                            placeholder=" "
                        />
                        <label htmlFor="confirmPassword">Confirm Password</label>
                    </div>
                    <i><p className='loginText'>Already had an account? <a className="loginLink" href="/auth/login">Login</a></p></i>
                    <button type="submit">Become a Wolf</button>
                </form>
            </div>
        </div>
    );
}

export default SignUp;