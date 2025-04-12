"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Props {
  isLogin: boolean;
}

interface FormState {
  name?: string;
  email: string;
  password: string;
}

export default function AuthForm({ isLogin }: Props) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const endpoint = isLogin ? "/login" : "/signup";
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth${endpoint}`,
        form,
        { withCredentials: true }
      );

      if (isLogin) {
        setMsg(`✅ Welcome ${data.user.name}`);
        router.push("/dashboard");
      } else {
        setMsg("✅ Signup successful. Please check your email to verify.");
        setSuccess(true);
      }
    } catch (err: any) {
      setMsg(`❌ ${err.response?.data?.msg || "Something went wrong."}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        router.push("/verify-info");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [success, router]);

  return (
    <div className="max-w-md mx-auto mt-24 bg-white p-6 rounded-xl shadow-md space-y-4 text-black">
      <h2 className="text-2xl font-bold text-center">
        {isLogin ? "Sign In" : "Sign Up"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full border rounded px-3 py-2"
            onChange={handleChange}
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className={`w-full py-2 rounded text-white ${loading ? "bg-gray-500" : "bg-black hover:opacity-90"}`}
          disabled={loading}
        >
          {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
        </button>
      </form>

      {msg && <p className="text-center text-sm">{msg}</p>}
    </div>
  );
}
