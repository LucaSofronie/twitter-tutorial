const signup = async (req, res) => {
  res.json({
    data: "You hit the signup endpoint",
  });
};

const login = async (req, res) => {
  res.json({
    data: "You hit the login endpoint",
  });
};

const logout = async (req, res) => {
  res.json({
    data: "You hit the logout endpoint",
  });
};

module.exports = { signup, login, logout };
