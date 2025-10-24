import json
import subprocess

# Test cases representing different mental health levels
test_cases = [
    {
        "name": "Case 1: Critical Mental Health (High Risk)",
        "data": {
            "Age": 28,
            "Gender": "Female",
            "Education_Level": "High School",
            "Sleep_Hours": 4.0,
            "Sleep_Quality": 2.5,
            "Diet_Quality": "Poor",
            "Exercise_Freq": 0,
            "Stress_Level": 10,
            "Anxiety_Level": 10,
            "Depression_Symptoms": 9,
            "Self_Esteem": 2,
            "Coping_Skills": 1,
            "Life_Satisfaction": 2,
            "Life_Purpose": 1,
            "Family_Support": 3,
            "Social_Isolation": 10,
            "Loneliness_Frequency": 10,
            "Relationship_Quality": 2,
            "Physical_Disability": "Yes",
            "Disability_Adjustment": 3,
            "Chronic_Illness": "Yes",
            "Work_Study_Pressure": "High",
            "Weekly_Work_Study_Hours": 65,
            "Financial_Stress": 10,
            "Access_Therapy": "No",
            "Substance_Use": "Alcohol",
            "Screen_Time": 12.0
        }
    },
    {
        "name": "Case 2: Poor Mental Health",
        "data": {
            "Age": 32,
            "Gender": "Male",
            "Education_Level": "Graduate",
            "Sleep_Hours": 5.5,
            "Sleep_Quality": 4.0,
            "Diet_Quality": "Average",
            "Exercise_Freq": 1,
            "Stress_Level": 8,
            "Anxiety_Level": 8,
            "Depression_Symptoms": 7,
            "Self_Esteem": 4,
            "Coping_Skills": 3,
            "Life_Satisfaction": 4,
            "Life_Purpose": 3,
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
            "Access_Therapy": "Yes",
            "Substance_Use": "Smoking",
            "Screen_Time": 9.5
        }
    },
    {
        "name": "Case 3: Fair Mental Health (Moderate)",
        "data": {
            "Age": 45,
            "Gender": "Female",
            "Education_Level": "Postgraduate",
            "Sleep_Hours": 6.5,
            "Sleep_Quality": 5.5,
            "Diet_Quality": "Average",
            "Exercise_Freq": 3,
            "Stress_Level": 6,
            "Anxiety_Level": 6,
            "Depression_Symptoms": 5,
            "Self_Esteem": 5,
            "Coping_Skills": 5,
            "Life_Satisfaction": 5,
            "Life_Purpose": 5,
            "Family_Support": 6,
            "Social_Isolation": 6,
            "Loneliness_Frequency": 6,
            "Relationship_Quality": 6,
            "Physical_Disability": "Yes",
            "Disability_Adjustment": 7,
            "Chronic_Illness": "Yes",
            "Work_Study_Pressure": "Medium",
            "Weekly_Work_Study_Hours": 40,
            "Financial_Stress": 6,
            "Access_Therapy": "Yes",
            "Substance_Use": "Alcohol",
            "Screen_Time": 6.5
        }
    },
    {
        "name": "Case 4: Good Mental Health",
        "data": {
            "Age": 26,
            "Gender": "Male",
            "Education_Level": "Graduate",
            "Sleep_Hours": 7.5,
            "Sleep_Quality": 7.5,
            "Diet_Quality": "Good",
            "Exercise_Freq": 4,
            "Stress_Level": 4,
            "Anxiety_Level": 3,
            "Depression_Symptoms": 3,
            "Self_Esteem": 7,
            "Coping_Skills": 7,
            "Life_Satisfaction": 7,
            "Life_Purpose": 7,
            "Family_Support": 8,
            "Social_Isolation": 4,
            "Loneliness_Frequency": 3,
            "Relationship_Quality": 7,
            "Physical_Disability": "No",
            "Disability_Adjustment": 10,
            "Chronic_Illness": "No",
            "Work_Study_Pressure": "Low",
            "Weekly_Work_Study_Hours": 35,
            "Financial_Stress": 4,
            "Access_Therapy": "No",
            "Substance_Use": "Alcohol",
            "Screen_Time": 5.0
        }
    },
    {
        "name": "Case 5: Excellent Mental Health",
        "data": {
            "Age": 35,
            "Gender": "Female",
            "Education_Level": "Postgraduate",
            "Sleep_Hours": 8.0,
            "Sleep_Quality": 9.0,
            "Diet_Quality": "Good",
            "Exercise_Freq": 6,
            "Stress_Level": 2,
            "Anxiety_Level": 2,
            "Depression_Symptoms": 1,
            "Self_Esteem": 9,
            "Coping_Skills": 9,
            "Life_Satisfaction": 9,
            "Life_Purpose": 9,
            "Family_Support": 9,
            "Social_Isolation": 2,
            "Loneliness_Frequency": 1,
            "Relationship_Quality": 9,
            "Physical_Disability": "No",
            "Disability_Adjustment": 10,
            "Chronic_Illness": "No",
            "Work_Study_Pressure": "Low",
            "Weekly_Work_Study_Hours": 30,
            "Financial_Stress": 2,
            "Access_Therapy": "No",
            "Substance_Use": "Alcohol",
            "Screen_Time": 3.0
        }
    }
]

print("="*80)
print("🧪 TESTING ML MODEL WITH MULTIPLE CASES")
print("="*80)

for i, test_case in enumerate(test_cases, 1):
    print(f"\n{'='*80}")
    print(f"TEST CASE {i}: {test_case['name']}")
    print("="*80)
    
    # Call predict.py
    result = subprocess.run(
        ['python', 'predict.py', json.dumps(test_case['data'])],
        capture_output=True,
        text=True
    )
    
    try:
        prediction = json.loads(result.stdout)
        
        if prediction.get('success'):
            print(f"\n✅ Prediction: {prediction['prediction']}")
            print(f"🎯 Confidence: {prediction['confidence']}%")
            print(f"⚠️  Risk Level: {prediction['risk_level']}")
            print(f"\n📊 Key Risk Factors:")
            for factor in prediction.get('risk_factors', [])[:3]:
                print(f"   • {factor}")
            print(f"\n💡 Top Recommendations:")
            for rec in prediction.get('recommendations', [])[:3]:
                print(f"   • {rec}")
        else:
            print(f"\n❌ Prediction Failed: {prediction.get('error')}")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print(result.stdout)

print("\n" + "="*80)
print("✅ ALL TEST CASES COMPLETED")
print("="*80)
