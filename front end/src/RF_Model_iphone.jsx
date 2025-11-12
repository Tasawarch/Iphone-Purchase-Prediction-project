import { useState } from "react";
import InputField from "../components/InputField ";
import SelectField from "../components/SelectField "
import Button from "../components/Button"

const RF_Model_iphone = () => {
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState("");
  const [salary, setSalary] = useState("");
  const [singleResult, setSingleResult] = useState("");
  const [loadingSingle, setLoadingSingle] = useState(false);

  const [file, setFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState("");
  const [loadingFile, setLoadingFile] = useState(false);

  // Single record prediction
  const handleSinglePredict = async () => {
    if (!age || !salary) {
      setSingleResult("Please fill in all fields.");
      return;
    }

    setLoadingSingle(true);
    setSingleResult("");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Gender: gender, Age: Number(age), Salary: Number(salary) }),
      });
      const data = await response.json();
      setSingleResult(data.result || data.error || "Prediction failed.");
    } catch (err) {
      console.error(err);
      setSingleResult("Error occurred during prediction.");
    } finally {
      setLoadingSingle(false);
    }
  };

  // File upload
  const handleFileUpload = async () => {
    setUploadMsg("");
    if (!file) {
      setUploadMsg("Please select a CSV or Excel file to upload.");
      return;
    }

    // Optional: Check file extension in UI
    if (!file.name.toLowerCase().endsWith(".csv") && !file.name.toLowerCase().endsWith(".xlsx")) {
      setUploadMsg("Please select a CSV or Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoadingFile(true);
      const response = await fetch("http://127.0.0.1:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.error) setUploadMsg(data.error);
      else setUploadMsg("File processed successfully! Click Download to get results.");
    } catch (err) {
      console.error(err);
      setUploadMsg("File upload failed.");
    } finally {
      setLoadingFile(false);
    }
  };

  // Download
  const handleDownload = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/download");
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Download failed");
        return;
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "predicted_results.csv";
      link.click();
    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-10">
      {/* Single Prediction */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-blue-600">Single Record Prediction</h2>
        <SelectField
          label="Gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ]}
        />
        <InputField label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Enter Age" />
        <InputField label="Salary" type="number" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Enter Salary" />
        <Button onClick={handleSinglePredict} disabled={loadingSingle}>
          {loadingSingle ? "Predicting..." : "Predict"}
        </Button>
        {singleResult && <div className="mt-4 p-3 bg-gray-50 rounded-lg border text-gray-700"><strong>Result:</strong> {singleResult}</div>}
      </div>

      <hr className="border-gray-300" />

      {/* File Upload */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-blue-600">CSV / XLSX File Prediction</h2>
       <input
  type="file"
  accept=".csv, .xlsx"
  onChange={(e) => {
    console.log("Selected file:", e.target.files[0]);
    setFile(e.target.files[0]);
    setUploadMsg("");
  }}
/>
        <Button onClick={handleFileUpload} disabled={loadingFile}>
  {loadingFile ? "Processing..." : "Upload & Predict"}
</Button>

{uploadMsg && (
  <p className={`mt-2 text-sm ${uploadMsg.includes("failed") ? "text-red-500" : "text-green-600"}`}>
    {uploadMsg}
  </p>
)}


<Button onClick={handleDownload} className="mt-6">
  Download Result
</Button>

      </div>
    </div>
  );
};

export default RF_Model_iphone;
