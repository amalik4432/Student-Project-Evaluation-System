import { useDispatch } from "react-redux";

import { authActions } from "../../store/authSlice";
import Button from "../UI/Button";
import classes from "./Topbar.module.css";

const Topbar = (props) => {
  const dispatch = useDispatch();

  const logoutHandler = () => {
    dispatch(authActions.logout());
    window.location.reload();
  };

  return (
    <div className={classes.container}>
      <div className={classes.heading}>
        <span className={classes.kicker}>FYPMS / workspace</span>
        <p>
          Good to see you, <strong>{props.user.name}</strong>
        </p>
      </div>
      <div className={classes.group}>
        <span className={classes.role}>Active session</span>
        <Button onClick={logoutHandler}>Log out</Button>
      </div>
    </div>
  );
};

export default Topbar;
