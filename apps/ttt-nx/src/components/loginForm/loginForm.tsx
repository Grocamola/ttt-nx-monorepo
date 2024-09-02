import { FormEvent, useEffect, useMemo, useState } from 'react';
import socket from '../socket/socket';
import { FormData, signinResponseType } from '../types-interfaces/types';

export default function LoginForm() {
  const [errorUsename, setErrorUsername] = useState<boolean>(false);
  const [errorPassword, setErrorPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });

  useMemo(() => {
    socket.on('signin-response', (data: signinResponseType) => {
      if (!data.success) {
        setErrorMessage(data.error);
      }
    });
    return () => {
      socket.off('signin-response');
    };
  }, [errorMessage === 'Waiting...']);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData: FormData = {
      username: (
        event.currentTarget.elements.namedItem('username') as HTMLInputElement
      ).value,
      password: (
        event.currentTarget.elements.namedItem('password') as HTMLInputElement
      ).value,
    };

    formData.username.length < 3
      ? setErrorUsername(true)
      : setErrorUsername(false);
    formData.password.length < 3
      ? setErrorPassword(true)
      : setErrorPassword(false);

    if (errorUsename || errorPassword) {
      console.log(errorUsename, errorPassword);
      console.log(formData.username.length, formData.password.length);
      return;
    } else {
      console.log(formData);
      socket.emit('signin', formData);
      setFormData({ username: '', password: '' });
      setErrorMessage('Waiting...');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ marginBottom: !errorUsename ? 26 : 0 }}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          name="username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          style={{ border: errorUsename ? '2px solid red' : '1px solid #888' }}
          onClick={() => {
            setErrorUsername(false), setErrorMessage('');
          }}
        />
      </p>
      <p
        className="form-error"
        style={{ display: errorUsename ? 'Block' : 'none' }}
      >
        Please enter a valid username
      </p>
      <p style={{ marginBottom: !errorPassword ? 26 : 0 }}>
        <label htmlFor="summary">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          style={{ border: errorPassword ? '2px solid red' : '1px solid #888' }}
          onClick={() => {
            setErrorPassword(false), setErrorMessage('');
          }}
        />
      </p>
      <p
        className="form-error"
        style={{ display: errorPassword ? 'Block' : 'none' }}
      >
        Please enter a valid password
      </p>
      <p
        className="form-error"
        style={{
          display: errorMessage ? 'block' : 'none',
          color: errorMessage === 'Waiting...' ? '#000' : 'red',
        }}
      >
        {errorMessage}
      </p>
      <p>
        <button type="submit">Login</button>
      </p>
    </form>
  );
}
