import { SignIn } from "@clerk/nextjs";

const LoginPage = () => (
  <div className="flex justify-center items-center h-screen">
    <SignIn />
  </div>
);

export default LoginPage;