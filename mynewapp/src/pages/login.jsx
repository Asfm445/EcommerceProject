import { useState } from "react";
import Form from "../components/form";

function Login() {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });
  return (
    <Form
      type={"Login"}
      inputs={inputs}
      setInputs={setInputs}
      apiUrl={"api/token/"}
    ></Form>
  );
}

export default Login;
