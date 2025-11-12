from flask import Flask, request, jsonify, send_file
import pickle
import pandas as pd
from flask_cors import CORS
import io

app = Flask(__name__)
CORS(app)

# Load model
with open("iphone_model.pkl", "rb") as f:
    model = pickle.load(f)

last_processed_df = None

# File upload and batch prediction
@app.route("/upload", methods=["POST"])
def upload_file():
    global last_processed_df
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    try:
        # Try reading as CSV
        try:
            df = pd.read_csv(file)
        except Exception:
            file.seek(0)  # Reset file pointer
            try:
                df = pd.read_excel(file)
            except Exception:
                return jsonify({"error": "File must be a valid CSV or Excel file"}), 400

        required_cols = {"Gender", "Age", "Salary"}
        if not required_cols.issubset(df.columns):
            return jsonify({"error": f"File must contain columns: {', '.join(required_cols)}"}), 400

        # Encode gender
        df["Gender"] = df["Gender"].apply(lambda x: 1 if str(x).lower() == "male" else 0)
        predictions = model.predict(df[["Gender", "Age", "Salary"]])
        df["Prediction"] = ["Will Purchase iPhone" if p == 1 else "Will Not Purchase iPhone" for p in predictions]

        last_processed_df = df.copy()

        return jsonify({"message": "File processed successfully!", "result": df.head(10).to_dict(orient="records")})
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": f"File processing failed: {str(e)}"}), 500

# Single prediction
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    gender = data.get("Gender")
    age = data.get("Age")
    salary = data.get("Salary")
    if gender is None or age is None or salary is None:
        return jsonify({"error": "Missing input fields"}), 400
    gender_val = 1 if str(gender).lower() == "male" else 0
    prediction = model.predict([[gender_val, age, salary]])
    result = "Will Purchase iPhone" if prediction[0] == 1 else "Will Not Purchase iPhone"
    return jsonify({"result": result})

# Download CSV
@app.route("/download", methods=["GET"])
def download_file():
    global last_processed_df
    if last_processed_df is None:
        return jsonify({"error": "No processed file available for download"}), 400

    output = io.StringIO()
    last_processed_df.to_csv(output, index=False)
    output.seek(0)

    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype="text/csv",
        as_attachment=True,
        download_name="predicted_results.csv"
    )

if __name__ == "__main__":
    app.run(debug=True, port=5001)
