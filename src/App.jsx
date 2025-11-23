// frontend/src/App.jsx
import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {
  const token = localStorage.getItem("theplug_token");
  return <>{token ? <Dashboard /> : <Login />}</>;
}

export default App;
