import React, { useState } from "react";
import axios from 'axios';

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post(`http://127.0.0.1:8000/authenticate`, {
      email,
      password
    })
      .then((response) => {
        console.log(response)
      })
  };

  const handleEmailChange = (event) => setEmail(event.target.value);
  const habdlePasswordChange = (event) => setPassword(event.target.value);

  return (
    <form action="/authenticate" method="POST" onSubmit={handleSubmit}>
      <fieldset>
        <label htmlFor="email">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          inputMode="email"
          autoComplete="username"
        />
      </fieldset>
      <fieldset>
        <label htmlFor="password">Senha</label>
        <input
          type="password"
          value={password}
          onChange={habdlePasswordChange}
          autoComplete="current-password"
        />
      </fieldset>
      <button type="submit">Entrar</button>
    </form>
  );
}
