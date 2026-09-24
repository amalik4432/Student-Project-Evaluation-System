import { NavLink } from "react-router-dom";

import Topbar from "./Topbar";

import "./Sidebar.css";

const Sidebar = (props) => {
  let sidebarLinks = props.links.map((link, index) => {
    return (
      <NavLink
        to={link.path}
        key={index}
        className={
          link.name === "Dashboard" || link.path === "/"
            ? "link dashboard"
            : "link"
        }
      >
        <div className={"icon"}>{link.icon}</div>
        <div className={"link_text"}>{link.name}</div>
      </NavLink>
    );
  });

  return (
    <>
      <div className={"main_container"}>
        <div className={"sidebar"}>
          <div className={"brand"}>
            <div className={"brand_mark"}>F</div>
            <div>
              <strong>FYPMS</strong>
              <span>Project workspace</span>
            </div>
          </div>
          <p className={"section_label"}>Workspace</p>
          <section className={"routes"}>{sidebarLinks}</section>
          <div className={"sidebar_footer"}>
            <span className={"status_dot"} />
            <span>Workspace online</span>
          </div>
        </div>

        <main>
          <Topbar user={props.user} />
          <div className={"page_content"}>{props.children}</div>
        </main>
      </div>
    </>
  );
};

export default Sidebar;
