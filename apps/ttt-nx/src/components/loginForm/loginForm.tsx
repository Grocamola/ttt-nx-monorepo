import { FormEvent, useMemo, useState } from 'react';
import { z } from 'zod';
import socket from '../utils/socket/socket';
import { formCheck, signinResponseType, FormErrors } from '../utils/types-interfaces/types';

export default function LoginForm() {

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState<z.infer<typeof formCheck>>({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useMemo(() => {
    socket.on('signin-response', (data: signinResponseType) => {
      if (!data.success) {
        setErrorMessage(data.error);
      }
    });
    return () => {
      socket.off('signin-response');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMessage === 'Waiting...']);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData: z.infer<typeof formCheck> = {
      username: (
        event.currentTarget.elements.namedItem('username') as HTMLInputElement
      ).value,
      password: (
        event.currentTarget.elements.namedItem('password') as HTMLInputElement
      ).value,
    };

    const formZodCheck = formCheck.safeParse(formData);

    if (!formZodCheck.success) {
      console.log(errors);
      const fieldErrors: FormErrors = {
        username: formZodCheck.error.format().username?._errors[0] || '',
        password: formZodCheck.error.format().password?._errors[0] || '',
      };
      setErrors(fieldErrors);
      return;
    } else {
      setErrors({});
      console.log(formData);
      socket.emit('signin', formData);
      setFormData({ username: '', password: '' });
      setErrorMessage('Waiting...');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>
        {/*  style={{ marginBottom: !errorUsename ? 26 : 0 }} */}
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          name="username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          onClick={() => {setErrors({}); setErrorMessage('')}}
        />
      </p>
      {errors.username && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.username}</p>}
      <p>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          onClick={() => {setErrors({}); setErrorMessage('')}}
        />
      </p>
      {errors.password && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.password}</p>}
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
