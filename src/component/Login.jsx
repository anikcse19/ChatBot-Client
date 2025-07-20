import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { createUser } from "../api/api";

const Login = () => {
  const [signUp, setSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate= useNavigate()
  const handleLogin = async (e) => {
    e.preventDefault(); // prevent page refresh
    const user = {
      name,
      email,
      role: "user",
    };
    try {
      const res = await createUser(user); // call API
      console.log("Created user:", res?.data?.user);
      setName("");
      setEmail("");
      navigate(`/user/${res?.data?.user?._id}`);

    } catch (err) {
      console.error("Error creating user:", err);
    }

  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-zinc-800">
      <div className="mb-6 space-x-4">
        <button
          className="border px-8 py-4 text-xl rounded-md"
          onClick={() => setSignUp(true)}
        >
          Login as User
        </button>
        <Link to={"/admin"}>
          <button className="border px-8 py-4 text-xl rounded-md">
            Login as Admin
          </button>
        </Link>
      </div>
      {signUp === true && (
        <div className="w-full max-w-sm rounded-lg border bg-white dark:border-zinc-700 dark:bg-zinc-900 flex flex-col items-center overflow-hidden p-4 sm:p-8">
          <form
            className="w-full space-y-3 sm:space-y-5"
            onSubmit={handleLogin}
          >
            <h1 className="mb-3 uppercase sm:mb-5 sm:text-2xl">Log in</h1>

            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md border p-2.5 outline-none ring-zinc-700 focus:ring-1 dark:border-zinc-700"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border p-2.5 outline-none ring-zinc-700 focus:ring-1 dark:border-zinc-700"
            />

            <button
              type="submit"
              className="mx-auto block rounded-md border px-5 py-2 uppercase shadow-lg duration-200 hover:bg-zinc-400/10 dark:border-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-white"
            >
              Submit
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;
