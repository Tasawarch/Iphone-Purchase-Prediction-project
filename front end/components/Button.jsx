const Button = ({ children, onClick, loading, disabled, className }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-300 ${
      loading ? "cursor-wait" : "cursor-pointer"
    } ${className || ""}`}
  >
    {loading ? "Loading..." : children}
  </button>
);

export default Button;
