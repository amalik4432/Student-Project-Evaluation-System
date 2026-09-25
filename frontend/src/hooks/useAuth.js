import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../store/authSlice";
import { api } from "../api/client";

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.login);
  useEffect(() => {
    if (auth.isAuthenticated) return;
    api("/me").then((result) => {
      if (result.ok && result.data?.user) {
        dispatch(authActions.restore(result.data.user));
      }
    });
  }, [auth.isAuthenticated, dispatch]);

  const logout = async () => {
    await api("/logout", { method: "post" });
    dispatch(authActions.logout());
  };

  return {
    ...auth,
    logout,
  };
};
