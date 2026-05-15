import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    country: "",
    incomeBracket: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        incomeBracket: formData.incomeBracket || undefined,
      });
    } catch (err) {
      setError(err?.message || err || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Create an Account</h1>
        <p className="login-subtitle">Fill in your details to get started</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="login-input"
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="login-input"
              minLength={6}
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="login-input"
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="login-input"
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="login-input"
              required
            >
              <option value="">Select country</option>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="login-field">
            <label className="login-label">Income Bracket (optional)</label>
            <select
              name="incomeBracket"
              value={formData.incomeBracket}
              onChange={handleChange}
              className="login-input"
            >
              <option value="">Select</option>
              <option value="low">Low</option>
              <option value="middle">Middle</option>
              <option value="high">High</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="login-signup">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
