from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import shap
 
#Model Loading
pipeline_data = joblib.load("bharatscore_pipeline.pkl")
model_pipeline = pipeline_data["model"]
best_threshold = pipeline_data["threshold"]

print(f"Model & pipeline loaded | Best threshold: {best_threshold}")
print("Pipeline steps:", list(model_pipeline.named_steps.keys()))

app = FastAPI(title="Bharat Score API", description="API for Bharat Score Prediction", version="1.0")

class InputData(BaseModel):
    user_type: str
    region: str
    sms_count: float
    bill_on_time_ratio: float
    recharge_freq: float
    sim_tenure: float
    location_stability: float
    income_signal: float
    coop_score: float
    land_verified: int
    age_group: str
    
def get_risk_tier(pd):
    if pd < 0.05: return "A+"
    elif pd < 0.10: return "A"
    elif pd < 0.20: return "B"
    elif pd < 0.35: return "C"
    else: return "D"
    
@app.post("/predict")
def predict(data: InputData):
    df = pd.DataFrame([data.dict()])

    pd_prob = model_pipeline.predict_proba(df)[:, 1][0]
    risk_tier = get_risk_tier(pd_prob)

    classifier = model_pipeline.named_steps['classifier']
    preprocessor = model_pipeline.named_steps['preprocessor']

    X_transformed = preprocessor.transform(df)

    explainer = shap.TreeExplainer(classifier)

    shap_values = explainer.shap_values(X_transformed)

    if isinstance(shap_values, list):
        if len(shap_values) > 1:
            shap_values = shap_values[1]
        else:
            shap_values = shap_values[0]

    shap_values = shap_values[0]

    feature_names = preprocessor.get_feature_names_out()

    feature_importance = sorted(
        zip(feature_names, shap_values),
        key=lambda x: abs(x[1]),
        reverse=True
    )[:5]

    return {
        "pd": round(float(pd_prob), 4),
        "risk_tier": risk_tier,
        "prediction": "High Risk" if pd_prob > best_threshold else "Low Risk",
        "top_features": [
            {"feature": f, "impact": round(float(v), 4)}
            for f, v in feature_importance
        ]
    }
    
@app.get("/")
def root():
    return {"message": "Bharat Score API is running!"}