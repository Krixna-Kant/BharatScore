from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import os
import pymongo
import joblib
import pandas as pd
import shap

from dotenv import load_dotenv
from typing import Optional

load_dotenv()

#MongoDB connection
client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = client["bharatscore"]
users_coll = db["users"]

#Model Loading
pipeline_data = joblib.load("bharatscore_pipeline.pkl")
model_pipeline = pipeline_data["model"]
best_threshold = pipeline_data["threshold"]

print(f"Model & pipeline loaded | Best threshold: {best_threshold}")
print("Pipeline steps:", list(model_pipeline.named_steps.keys()))

app = FastAPI(title="Bharat Score API", description="API for Bharat Score Prediction", version="1.0")

#CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#For Profile
class ProfileRequest(BaseModel):
    clerk_user_id: str
    name: str
    gender: str
    state: str
    occupation: str

@app.post("/profile")
def create_or_update_profile(req: ProfileRequest):
    """Create or update a basic user profile"""
    doc = {
        "clerk_user_id": req.clerk_user_id,
        "profile": {
            "name": req.name,
            "gender": req.gender,
            "state": req.state,
            "occupation": req.occupation,
        },
        "has_profile": True,
        "profile_updated_at": datetime.utcnow(),
    }
    users_coll.update_one(
        {"clerk_user_id": req.clerk_user_id},
        {"$set": doc},
        upsert=True
    )
    return {"status": "stored", "clerk_user_id": req.clerk_user_id}

@app.get("/profile")
def get_profile(clerk_user_id: str):
    """Return profile for a given clerk_user_id"""
    proj = {"_id": 0, "profile": 1, "has_profile": 1, "clerk_user_id": 1}
    user = users_coll.find_one({"clerk_user_id": clerk_user_id}, proj)
    if user and user.get("profile"):
        return {"profile": user["profile"], "has_profile": True}
    return {"profile": None, "has_profile": False}

class OnboardRequest(BaseModel):
    clerk_user_id: str
    user_type: str
    region: str
    sms_count: float
    bill_on_time_ratio: float | None = None
    recharge_freq: float
    sim_tenure: float
    location_stability: float
    income_signal: float
    coop_score: float
    land_verified: int
    age_group: str
    # device_id: str
    consent: bool = True

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

@app.post("/onboard")
def onboard(req: OnboardRequest):
    if req.bill_on_time_ratio is None:
        req.bill_on_time_ratio = 0.0 
    
    doc = {
        "clerk_user_id": req.clerk_user_id,
        "raw": req.dict(),
        "created": datetime.utcnow(),
        "status": "received"
    }
    inserted_id = users_coll.insert_one(doc).inserted_id
    return {"mongo_id": str(inserted_id), "clerk_user_id": req.clerk_user_id, "status": "stored"}

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

@app.get("/user/{user_id}")
def get_user(user_id: str):
    """Get user data by ID"""
    try:
        from bson import ObjectId
        user = users_coll.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
            return user
        return {"error": "User not found"}
    except Exception as e:
        return {"error": f"Invalid user ID: {str(e)}"}
    
@app.get("/users")
def get_all_users(clerk_user_id: str = None):
    """Get all users with Filter by Clerk User ID (that's because as of now we will fetch users from their Clerk ID)"""
    try:
        query = {}
        if clerk_user_id:
            query["raw.clerk_user_id"] = clerk_user_id
        
        users = list(users_coll.find(query).limit(100))
        for user in users:
            user["_id"] = str(user["_id"])
        return {"users": users, "count": len(users)}
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/predict/{user_id}")
def predict_existing_user(user_id: str):
    """Predict risk for an existing user from database"""
    try:
        from bson import ObjectId
        user = users_coll.find_one({"_id": ObjectId(user_id)})
        if not user:
            return {"error": "User not found"}
        
        raw_data = user["raw"]
        
        #Converting to InputData format
        input_data = {
            "user_type": raw_data["user_type"],
            "region": raw_data["region"],
            "sms_count": raw_data["sms_count"],
            "bill_on_time_ratio": raw_data.get("bill_on_time_ratio", 0.0),
            "recharge_freq": raw_data["recharge_freq"],
            "sim_tenure": raw_data["sim_tenure"],
            "location_stability": raw_data["location_stability"],
            "income_signal": raw_data["income_signal"],
            "coop_score": raw_data["coop_score"],
            "land_verified": raw_data["land_verified"],
            "age_group": raw_data["age_group"]
        }
        
        df = pd.DataFrame([input_data])
        
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
        
        #Updating user record with prediction
        prediction_result = {
            "pd": round(float(pd_prob), 4),
            "risk_tier": risk_tier,
            "prediction": "High Risk" if pd_prob > best_threshold else "Low Risk",
            "predicted_at": datetime.utcnow()
        }
        
        users_coll.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"prediction": prediction_result, "status": "predicted"}}
        )
        
        return {
            "user_id": user_id,
            "pd": round(float(pd_prob), 4),
            "risk_tier": risk_tier,
            "prediction": "High Risk" if pd_prob > best_threshold else "Low Risk",
            "top_features": [
                {"feature": f, "impact": round(float(v), 4)}
                for f, v in feature_importance
            ]
        }
        
    except Exception as e:
        return {"error": str(e)}
    
@app.get("/stats")
def get_stats():
    """Get database and prediction statistics"""
    try:
        total_users = users_coll.count_documents({})
        predicted_users = users_coll.count_documents({"prediction": {"$exists": True}})
        high_risk_users = users_coll.count_documents({"prediction.prediction": "High Risk"})
        low_risk_users = users_coll.count_documents({"prediction.prediction": "Low Risk"})
        
        return {
            "total_users": total_users,
            "predicted_users": predicted_users,
            "pending_predictions": total_users - predicted_users,
            "high_risk_users": high_risk_users,
            "low_risk_users": low_risk_users
        }
    except Exception as e:
        return {"error": str(e)}