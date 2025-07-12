import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useAuthStore from "@/store/authStore";
import axiosInstance from "../lib/axios";

const Signup = () => {
  const { user, setAuthUser } = useAuthStore();
  const navigate = useNavigate();

  const [input, setInput] = useState({
    name: "",       // 👈 Added name
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "auth/register",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setAuthUser(res.data.user);
        toast.success(res.data.message);
        navigate("/");
        setInput({ name: "", username: "", email: "", password: "" }); // 👈 Reset all
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        onSubmit={signupHandler}
        className="shadow-lg flex flex-col gap-5 p-6"
      >
        <div className="my-2">
          <h1 className="text-center font-bold text-xl">Re-Wear</h1>
          <p className="text-sm text-center mt-2">
            Register to start exchanging your clothes
          </p>
        </div>

        {/* 👇 Name field added here */}
        <div>
          <Label>Name</Label>
          <Input
            type="text"
            name="name"
            value={input.name}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        <div>
          <Label>Username</Label>
          <Input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        <div>
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        {loading ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </Button>
        ) : (
          <Button type="submit">Register</Button>
        )}

        <span className="text-center text-sm">
          Already have an account?
          <Link className="text-blue-600 mx-1" to="/login">
            Login
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Signup;
