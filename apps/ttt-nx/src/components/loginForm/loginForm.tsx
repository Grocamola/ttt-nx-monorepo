import { FormEvent, useState } from "react";
import socket from '../socket/socket';
import { FormData } from '../types-interfaces/types'


export default function LoginForm() {
    const [formData, setFormData] = useState<FormData>({
        username: "",
        password: "",
    });

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData: FormData = {
            username: (event.currentTarget.elements.namedItem("username") as HTMLInputElement).value,
            password: (event.currentTarget.elements.namedItem("password") as HTMLInputElement).value,
        };

        console.log(formData);
        
        socket.emit('signin', formData)

        setFormData({ username: "", password: "" });
    }

    return (
        <form onSubmit={handleSubmit}>
            <p>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
            </p>
            <p>
                <label htmlFor="summary">Password</label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
            </p>
            <p>
                <button type="submit">Login</button>
            </p>
        </form>
    );
}