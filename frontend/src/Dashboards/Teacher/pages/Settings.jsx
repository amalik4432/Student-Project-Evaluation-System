import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { ApiCall } from "../../../api/apiCall";
import CustomCard from "../../../Components/UI/CustomCard";
import Button from "../../../Components/UI/Button";

import classes from "./Settings.module.css";

const initialPasswordsState = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const Settings = (props) => {
  const { token, user_id } = useSelector((state) => state.login.input);

  const [passwords, setPasswords] = useState(initialPasswordsState);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPasswords((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (passwords.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setIsSaving(true);
    const response = await ApiCall({
      params: { ...passwords, userId: user_id },
      route: "teacher/update-password",
      verb: "put",
      token,
      baseurl: true,
    });
    setIsSaving(false);
    if (response?.status === 200) {
      toast.success("Password updated. Please sign in again.");
      setPasswords(initialPasswordsState);
      await ApiCall({
        params: {},
        route: "logout",
        verb: "post",
        token,
        baseurl: true,
      });
      setTimeout(() => window.location.reload(), 800);
    } else {
      toast.error(response?.response?.message || "Could not update password.");
    }
  };

  return (
    <div className={classes["main-container"]}>
      <CustomCard>
        <div className={classes.container}>
          <Form onSubmit={handleSubmit} className={classes.form}>
            <Form.Group controlId="oldPassword">
              <Form.Label>Old Password</Form.Label>
              <Form.Control
                type="password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="newPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Updating..." : "Update password"}
            </Button>
          </Form>
        </div>
      </CustomCard>
    </div>
  );
};

export default Settings;
