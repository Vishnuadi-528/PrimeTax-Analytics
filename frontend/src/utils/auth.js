// src/utils/auth.js

const TOKEN_KEY = "taxpal_token";

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};

export const clearAuth = () => {
  removeToken();
};
