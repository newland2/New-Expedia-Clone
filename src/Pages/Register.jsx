import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import firebase_app from "../01_firebase/config_firebase";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { fetch_users, userRigister } from "../Redux/Authantication/auth.action";
import Navbar from "../Components/Navbar";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// ✅ define auth like in Login.jsx
const auth = getAuth(firebase_app);

export const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user = [], isLoading } = useSelector((store) => ({
    user: store.LoginReducer.user,
    isLoading: store.LoginReducer.isLoading,
  }));

  const userExists = (phoneNumber) =>
    Array.isArray(user) && user.some((u) => u.number === phoneNumber.replace("+", ""));

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verifyStep, setVerifyStep] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );
    }
  }, []);

  useEffect(() => {
    dispatch(fetch_users());
  }, [dispatch]);

  const handleVerifyNumber = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!phone || phone.length < 8) {
      setErrorMsg("Please enter a valid phone number.");
      setLoading(false);
      return;
    }

    if (userExists(phone)) {
      setErrorMsg("User already exists. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone, // Firebase requires "+"
        appVerifier
      );
      window.confirmationResult = confirmationResult;
      setVerifyStep(true);
      setSuccessMsg(`OTP sent to ${phone}`);
    } catch (error) {
      console.error("SMS not sent:", error);
      setErrorMsg("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await window.confirmationResult.confirm(otp);
      setOtpVerified(true);
      setSuccessMsg("Phone number verified successfully!");
    } catch (error) {
      console.error("Invalid OTP:", error);
      setErrorMsg("Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = () => {
    const cleanPhone = phone.replace("+", ""); // strip + before saving
    const newUser = {
      number: cleanPhone,
      user_name: userName,
      password,
      email: "",
      dob: "",
      gender: "",
      marital_status: null,
    };

    dispatch(userRigister(newUser));
    setSuccessMsg("Account created! Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="mainLogin">
      <div id="recaptcha-container"></div>
      <div className="loginBx">
        {/* ...logo and header */}

        {!verifyStep && !otpVerified && (
          <div className="loginInputB">
            <label>Enter Your Phone Number</label>
            <PhoneInput
              country={"us"}
              value={phone}
              onChange={(value) => setPhone("+" + value)}
              inputStyle={{ width: "100%" }}
              disabled={verifyStep}
            />
            <button disabled={loading} onClick={handleVerifyNumber}>
              {loading ? "Please wait..." : "Send OTP"}
            </button>
          </div>
        )}

        {verifyStep && !otpVerified && (
          <div className="loginInputB">
            <label>Enter OTP</label>
            <input
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button disabled={loading} onClick={verifyCode}>
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        )}

        {otpVerified && (
          <>
            <div className="loginInputB">
              <label>Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="loginInputB">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button onClick={handleRegisterUser} disabled={loading}>
              {loading ? "Registering..." : "Continue"}
            </button>
          </>
        )}

        {isLoading && <h3>Please wait...</h3>}
        {errorMsg && <h3 id="loginMessageError">{errorMsg}</h3>}
        {successMsg && <h3 id="loginMessageSuccess">{successMsg}</h3>}
      </div>
    </div>
  );
};
