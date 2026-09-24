import LoginForm from "../Components/Forms/LoginForm";

import classes from "./Login.module.css";

const Login = () => {
  return (
    <main className={classes.page}>
      <section className={classes.story}>
        <div className={classes.storyTop}>
          <div className={classes.mark}>F</div>
          <span>FYPMS / 2026</span>
        </div>
        <div className={classes.storyCopy}>
          <p className={classes.eyebrow}>One workspace. Every milestone.</p>
          <h1>
            Make the work
            <br />
            <em>worth remembering.</em>
          </h1>
          <p className={classes.description}>
            Keep projects, people, reviews, and the next important step in one
            clear place.
          </p>
        </div>
        <div className={classes.storyFooter}>
          <img src="/images/logo.png" alt="University of Education logo" />
          <span>University of Education</span>
        </div>
      </section>
      <section className={classes.formPanel}>
        <div className={classes.formHeader}>
          <p className={classes.eyebrow}>FYPMS portal</p>
          <h2>Welcome back.</h2>
          <p>Sign in to pick up where your project left off.</p>
        </div>
        <LoginForm />
        <p className={classes.securityNote}>
          Private workspace · secure access
        </p>
      </section>
    </main>
  );
};

export default Login;
