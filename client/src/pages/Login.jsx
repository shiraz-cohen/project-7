import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Login() {
  const [inputsName, setInputsName] = useState({});
  const [inputsPass, setInputsPass] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange1 = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputsName((values) => ({ ...values, [name]: value }));
  };

  const handleChange2 = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputsPass((values) => ({ ...values, [name]: value }));
  };

  async function fetchData() {
    setInputsName({});
    setInputsPass({});
    try {
      const response = await fetch(
        "http://localhost:3000/userAPI/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: inputsName.username,
            password: inputsPass.password,
          }),
        }
      );

      if (response.ok) {
        try {
          const user = await response.json();

          if (user && user.message) {
            alert(user.message);
          } else {
            const response = await fetch(
              `http://localhost:3000/userAPI/api/users/${inputsName.username}`
            );
            const userData = await response.json();

            const currentUser = {
              id: userData[0]["ID"],
              name: userData[0]["name"],
              username: userData[0]["username"],
              userRank: userData[0]["userRank"],
            };

            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            console.log({ currentUser });
            if (currentUser.userRank === "admin") {
              navigate(`/Admin`);
            } else {
              navigate(`/Users`);
            }
          }
        } catch (error) {
          console.error(error);
          alert("An error occurred while processing your request.");
        }
      } else if (response.status === 401) {
        alert("Username or password is incorrect");
      } else if (response.status === 500) {
        alert("Server error");
      } else if (response.status === 400) {
        alert("Missing username or password");
      } else {
        alert("An error occurred while processing your request.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch data. Please check your connection.");
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchData();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchData();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="loginPage">
      <form className="loginForm" onSubmit={handleSubmit}>
        <h1 className="logo">Rush hour</h1>
        {/* <h1>Login</h1> */}
        <div className="username-input form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={inputsName.username || ""}
            onChange={handleChange1}
          />
        </div>
        <br />
        <div className="password-input form-group">
          <label htmlFor="password">Password:</label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={inputsPass.password || ""}
            onChange={handleChange2}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
          <br />
        </div>
        <button className="loginBtn" type="submit">
          Login
        </button>
      </form>
      <img id="loginImg" src="/images/loginBackground.png"></img>
    </div>
  );
}
