import sys
import json
import joblib
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

def predict_mental_health(input_data):
    """
    Predict mental health status from user assessment
    """
    try:
        # Load model and encoders
        model = joblib.load('models/mental_health_model.pkl')
        encoders = joblib.load('models/label_encoders.pkl')
        
        # Create DataFrame from input
        df = pd.DataFrame([input_data])
        
        # Encode categorical variables with error handling
        categorical_cols = ['Gender', 'Education_Level', 'Diet_Quality', 
                           'Physical_Disability', 'Chronic_Illness', 
                           'Work_Study_Pressure', 'Access_Therapy', 'Substance_Use']
        
        for col in categorical_cols:
            if col in df.columns and col in encoders:
                le = encoders[col]
                try:
                    # Try to transform
                    df[col] = le.transform(df[col])
                except ValueError as e:
                    # If value not seen during training, use most common value
                    known_classes = list(le.classes_)
                    if len(known_classes) > 0:
                        # Use the first known class as default
                        df[col] = le.transform([known_classes[0]])
                    else:
                        df[col] = 0
        
        # Make prediction
        prediction = model.predict(df)[0]
        probabilities = model.predict_proba(df)[0]
        confidence = max(probabilities) * 100
        
        # Identify risk factors
        risk_factors = identify_risk_factors(input_data)
        
        # Generate recommendations
        recommendations = generate_recommendations(input_data, prediction)
        
        # Determine risk level
        risk_level = 'Critical' if prediction == 'Critical' else \
                    'High' if prediction == 'Poor' else \
                    'Moderate' if prediction == 'Fair' else 'Low'
        
        return {
            'success': True,
            'prediction': prediction,
            'confidence': round(confidence, 2),
            'risk_level': risk_level,
            'risk_factors': risk_factors,
            'recommendations': recommendations
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def identify_risk_factors(data):
    """Identify specific risk factors"""
    risks = []
    
    try:
        if float(data.get('Screen_Time', 0)) > 8:
            risks.append('Excessive screen time (>8 hours/day)')
        
        if int(data.get('Financial_Stress', 0)) > 7:
            risks.append('High financial stress')
        
        if int(data.get('Social_Isolation', 0)) > 7:
            risks.append('High social isolation')
        
        if int(data.get('Anxiety_Level', 0)) > 7:
            risks.append('Elevated anxiety levels')
        
        if int(data.get('Depression_Symptoms', 0)) > 7:
            risks.append('Significant depression symptoms')
        
        if float(data.get('Sleep_Hours', 0)) < 5:
            risks.append('Insufficient sleep (<5 hours)')
        
        if int(data.get('Loneliness_Frequency', 0)) > 7:
            risks.append('Frequent feelings of loneliness')
        
        if int(data.get('Stress_Level', 0)) > 8:
            risks.append('Very high stress levels')
        
        if int(data.get('Self_Esteem', 0)) < 4:
            risks.append('Low self-esteem')
        
        if int(data.get('Coping_Skills', 0)) < 4:
            risks.append('Poor coping mechanisms')
    except:
        pass
    
    return risks if risks else ['No major risk factors identified']

def generate_recommendations(data, prediction):
    """Generate personalized recommendations"""
    recommendations = []
    
    try:
        # Critical/Poor - Immediate professional help
        if prediction in ['Critical', 'Poor']:
            recommendations.append('Seek immediate professional help - consult a mental health professional')
            recommendations.append('Contact crisis helpline: AASRA 9152987821 | Vandrevala 18602662345')
        
        # Screen time recommendations
        if float(data.get('Screen_Time', 0)) > 6:
            recommendations.append('Reduce screen time to under 6 hours daily')
            recommendations.append('Take regular breaks every 20 minutes')
        
        # Exercise recommendations
        if int(data.get('Exercise_Freq', 0)) < 3:
            recommendations.append('Increase physical activity to 3-5 times per week')
            recommendations.append('Start with 30-minute daily walks')
        
        # Sleep recommendations
        if float(data.get('Sleep_Hours', 0)) < 7:
            recommendations.append('Aim for 7-8 hours of quality sleep each night')
            recommendations.append('Establish consistent bedtime routine')
        
        # Social connection recommendations
        if int(data.get('Social_Isolation', 0)) > 6:
            recommendations.append('Engage in social activities - join community groups')
            recommendations.append('Connect with friends and family regularly')
        
        # Stress management
        if int(data.get('Stress_Level', 0)) > 6:
            recommendations.append('Practice stress management techniques (meditation, yoga)')
        
        # Coping skills
        if int(data.get('Coping_Skills', 0)) < 5:
            recommendations.append('Explore self-help resources')
            recommendations.append('Practice journaling and mindfulness exercises')
        
        # Financial stress
        if int(data.get('Financial_Stress', 0)) > 7:
            recommendations.append('Seek financial counseling or support services')
        
        # Diet
        if data.get('Diet_Quality') == 'Poor':
            recommendations.append('Improve diet quality - eat nutritious meals regularly')
        
        # General
        if prediction in ['Good', 'Excellent']:
            recommendations.append('Maintain your current positive habits')
            recommendations.append('Take regular assessments to track your mental health')
    except:
        recommendations.append('Consult a mental health professional for personalized guidance')
    
    return recommendations[:8]  # Return top 8 recommendations

if __name__ == '__main__':
    try:
        if len(sys.argv) < 2:
            print(json.dumps({
                'success': False,
                'error': 'No input data provided'
            }))
            sys.exit(1)
        
        input_arg = sys.argv[1]
        
        # Check if it's a file path or JSON string
        if input_arg.endswith('.json'):
            # Read from file
            with open(input_arg, 'r', encoding='utf-8') as f:
                input_data = json.load(f)
        else:
            # Parse as JSON string
            input_data = json.loads(input_arg)
        
        # Make prediction
        result = predict_mental_health(input_data)
        
        # Output as JSON
        print(json.dumps(result))
        
    except json.JSONDecodeError as e:
        print(json.dumps({
            'success': False,
            'error': f'Invalid JSON input: {str(e)}'
        }))
    except FileNotFoundError as e:
        print(json.dumps({
            'success': False,
            'error': f'File not found: {str(e)}'
        }))
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }))
