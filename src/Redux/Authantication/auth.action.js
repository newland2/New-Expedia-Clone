import axios from "axios";
import {
  GET_USERS,
  LOGIN_ERROR,
  LOGIN_REQUEST,
  LOGIN_SUCCESSFUL,
  LOGOUT_USER,
  REGISTER_ERROR,
  REGISTER_REQUEST,
  REGISTER_SUCCESSFUL,
} from "./auth.actionType";

// Action creators
export const login_request = () => ({ type: LOGIN_REQUEST });
export const login_success = (payload) => ({ type: LOGIN_SUCCESSFUL, payload });
export const login_error = () => ({ type: LOGIN_ERROR });

export const register_request = () => ({ type: REGISTER_REQUEST });
export const register_success = (payload) => ({ type: REGISTER_SUCCESSFUL, payload });
export const register_error = () => ({ type: REGISTER_ERROR });

export const get_users = (payload) => ({ type: GET_USERS, payload });
export const handlelogout_user = () => ({ type: LOGOUT_USER });

// Register user
export const userRigister = (userData) => async (dispatch) => {
  dispatch(register_request());
  try {
    const cleanedUser = {
      ...userData,
      number: userData.number.startsWith("+")
        ? userData.number.slice(1)
        : userData.number,
    };
    const res = await axios.post(`/api/users`, cleanedUser); // 🔥 use relative path or deployed backend URL
    dispatch(register_success(res.data));
  } catch (err) {
    dispatch(register_error());
  }
};

// Fetch users
export const fetch_users = () => async (dispatch) => {
  dispatch(register_request());
  try {
    const res = await axios.get(`/api/users`); // 🔥 use relative path or deployed backend URL
    dispatch(get_users(res.data));
  } catch (err) {
    dispatch(register_error());
  }
};

// Login user
export const login_user = (loginData) => (dispatch) => {
  dispatch(login_success(loginData));
};

// Logout user
export const logout_user = () => (dispatch) => {
  dispatch(handlelogout_user());
  localStorage.setItem("MkuserData", JSON.stringify({}));
  localStorage.setItem("MkisAuth", JSON.stringify(false));
};
