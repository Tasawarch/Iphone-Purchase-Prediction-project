// SelectField.js
const SelectField = ({ label, value, onChange, options }) => (
  <div className="mb-4">
    <label className="block mb-1 font-semibold text-gray-700">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
