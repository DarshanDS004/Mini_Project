import json
import subprocess

# Sample input data for testing
test_data = {
    "Age": 25,
    "Gender": "Male",
    "Education_Level": "Graduate",
    "Sleep_Hours": 6.5,
    "Sleep_Quality": 7.0,
    "Diet_Quality": "Average",
    "Exercise_Freq": 3,
    "Stress_Level": 8,
    "Anxiety_Level": 8,
    "Depression_Symptoms": 7,
    "Self_Esteem": 4,
    "Coping_Skills": 4,
    "Life_Satisfaction": 4,
    "Life_Purpose": 4,
    "Family_Support": 5,
    "Social_Isolation": 8,
    "Loneliness_Frequency": 8,
    "Relationship_Quality": 4,
    "Physical_Disability": "No",
    "Disability_Adjustment": 10,
    "Chronic_Illness": "No",
    "Work_Study_Pressure": "High",
    "Weekly_Work_Study_Hours": 55,
    "Financial_Stress": 8,
    "Access_Therapy": "No",
    "Substance_Use": "None",
    "Screen_Time": 10.5
}

print("="*70)
print("🧪 Testing ML Model Prediction")
print("="*70)
print("\n📊 Input Data:")
print(json.dumps(test_data, indent=2))

# Call predict.py
result = subprocess.run(
    ['python', 'predict.py', json.dumps(test_data)],
    capture_output=True,
    text=True
)

print("\n🔮 Prediction Result:")
print("="*70)
try:
    prediction = json.loads(result.stdout)
    print(json.dumps(prediction, indent=2))
    
    if prediction.get('success'):
        print("\n✅ Prediction Status: SUCCESS")
        print(f"   Mental Health: {prediction['prediction']}")
        print(f"   Confidence: {prediction['confidence']}%")
        print(f"   Risk Level: {prediction['risk_level']}")
    else:
        print("\n❌ Prediction Status: FAILED")
        print(f"   Error: {prediction.get('error')}")
except:
    print(result.stdout)
    if result.stderr:
        print("Error:", result.stderr)
