import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./login.css";
import firebase_app from "../01_firebase/config_firebase";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { fetch_users, login_user } from "../Redux/Authantication/auth.action";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const auth = getAuth(firebase_app);

export const Login = () => {
  const dispatch = useDispatch();
  const { isAuth, user } = useSelector((store) => ({
    isAuth: store.LoginReducer.isAuth,
    user: store.LoginReducer.user,
  }));

  const [phone, setPhone] = useState(""); // full number with +
  const [otp, setOtp] = useState("");
  const [verifyStep, setVerifyStep] = useState(false);
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
    if (isAuth) {
      window.location = "/";
    }
  }, [isAuth, dispatch]);

  const findUser = (phoneNumber) =>
    user.find((u) => u.number === phoneNumber.replace("+", ""));

  const handleVerifyNumber = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!phone || phone.length < 8) {
      setErrorMsg("Please enter a valid phone number.");
      setLoading(false);
      return;
    }

    const existingUser = findUser(phone);
    if (!existingUser) {
      setErrorMsg("User does not exist. Redirecting to Register...");
      setTimeout(() => {
        window.location = "/register";
      }, 1000);
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
      setErrorMsg("Server Error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const result = await window.confirmationResult.confirm(otp);
      const firebaseUser = result.user;

      setSuccessMsg("Verified Successfully!");
      dispatch(login_user(findUser(phone))); // strips + inside
    } catch (error) {
      console.error("Invalid OTP:", error);
      setErrorMsg("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mainLogin">
      <div id="recaptcha-container"></div>

      <div className="loginBx">
        <div className="logoImgdiv">
          <img
            className="imglogo"
            src="https://i.postimg.cc/dQmyj8pd/Hang-In-There-1.jpg"
            alt="logo"
          />
        </div>

        <div className="loginHead">
          <hr />
          <hr />
          <hr />
          <h1>Sign In</h1>
        </div>

        <div className="loginInputB">
          <label>Enter Your Phone Number</label>
          <PhoneInput
            country={"us"}
            value={phone}
            onChange={(value) => setPhone("+" + value)}
            inputStyle={{ width: "100%" }}
            disabled={verifyStep}
          />
          <button disabled={verifyStep || loading} onClick={handleVerifyNumber}>
            {loading ? "Please wait..." : "Send OTP"}
          </button>
        </div>

        {verifyStep && (
          <div className="loginInputB">
            <label>Enter Your OTP</label>
            <span>
              <input
                type="number"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button disabled={loading} onClick={verifyCode}>
                Continue
              </button>
            </span>
          </div>
        )}

        <div className="loginTerms">
          <Link to="/register">Don't have an Account</Link>
          <Link to="/admin">Admin Login</Link>
          <div className="inpChecbx">
            <input className="inp" type="checkbox" />{" "}
            <h2>Keep me signed in</h2>
          </div>
          <p>
            Selecting this checkbox will keep you signed into your account on
            this device until you sign out. Do not select this on shared
            devices.
          </p>
          <h6>
            By signing in, I agree to the Expedia{" "}
            <span>Terms and Conditions</span>,{" "}
            <span>Privacy Statement</span> and{" "}
            <span>Expedia Rewards Terms and Conditions</span>.
          </h6>
        </div>

        {errorMsg && <h3 id="loginMessageError">{errorMsg}</h3>}
        {successMsg && <h3 id="loginMessageSuccess">{successMsg}</h3>}
      </div>
    </div>
  );
};
