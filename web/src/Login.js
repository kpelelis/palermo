import React from "react";

import { login } from "./api";

import './Login.css';

export default function Login(props) {
  const { onUserLogin } = props;
  const [username, setUsername] = React.useState("");

  return (
    <div className="login">
      <h3>Bάλε το username σου</h3>
      <input
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <div
        className="button"
        onClick={() => login(username).then(onUserLogin)}
      >
        Πάμε
      </div>
    </div>
  );
}
