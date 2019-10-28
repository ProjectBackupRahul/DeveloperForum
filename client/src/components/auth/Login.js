import React, { Fragment, useState } from 'react'
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login } from '../../actions/auth';
import { pseudoRandomBytes } from 'crypto';

const Login = ({ login, isAuthenticated }) => {
    const [formData, setFromData] = useState({
        
        email : '',
        password : ''
    });
    const { email, password} = formData;

    const onChange = e => setFromData({ ...formData, [e.target.name]: e.target.value });
    const onSubmit = async e => {
        login(email,password) 
    };

    // Redirect if loged in 

    if (isAuthenticated){
       return <Redirect to = "/dashboard"/>
    }
   
    return (
        <Fragment>  <h1 className="large text-primary">Sign In</h1>
        <p className="lead"><i className="fas fa-user"></i> Login Into Your Account</p>
        <form className="form" onSubmit = {e => onSubmit(e)}>
         
          <div className="form-group">
            <input type="email" placeholder="Email Address" name="email" 
            value = {email}
            onChange = {e => onChange(e)}
         required
            />
            <small className="form-text"
              >This site uses Gravatar so if you want a profile image, use a
              Gravatar email</small
            >
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              name="password"
              value = {password}
            onChange = {e => onChange(e)}
              required
              minLength="6"
            />
          </div>
      
          <input type="submit" className="btn btn-primary" value="Login" />
        </form>
        <p className="my-1">
          Don't have an account? <Link to="/Register">Sign Up</Link>
        </p>
        </Fragment>
    )
};

Login.propTypes = {
   login: PropTypes.func.isRequired,
   isAuthenticated: PropTypes.bool
}

const mapStateToProps = state => ({
   isAuthenticated:state.auth.isAuthenticated
});

export default connect(mapStateToProps, { login }) (Login);
