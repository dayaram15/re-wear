import { useState } from "react";
import { Label } from "@/components/ui/label";
"@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const Login = () => {
    const loading = false
  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        // onSubmit={loginHandler}
        className="shadow-lg flex flex-col gap-5 p-6"
      >
        <div className="my-3">
          <h1 className="text-center font-bold text-xl">Re-Wear</h1>
          <p className="text-sm text-center mt-3">
            Login to start exchanging your clothes
          </p>
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            // value={input.email}
            // onChange={changeEventHandler}
            className={`focus-visible:ring-transparent my-2 `}
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            // value={input.password}
            // onChange={changeEventHandler}
            className={`focus-visible:ring-transparent my-2 `}
          />
        </div>
        {
            loading?(
                <Button><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Please wait...</Button>
            ):( <Button>Login</Button>)
        }
       
         <span className="text-center text-sm">Does't have an account?<Link className="text-blue-600 mx-1" to="/signup">Signup</Link> </span>
      </form>
    </div>
  );
};

export default Login;
