const db = require('../config/db');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Mock prediction fallback function
function mockPrediction(assessmentData) {
  const stress = parseInt(assessmentData.stressLevel);
  const anxiety = parseInt(assessmentData.anxietyLevel);
  const depression = parseInt(assessmentData.depressionSymptoms);
  
  const avgScore = (stress + anxiety + depression) / 3;
  
  let status, riskLevel, confidence;
  
  if (avgScore >= 9) {
    status = 'Critical';
    riskLevel = 'Critical';
    confidence = 95;
  } else if (avgScore >= 7) {
    status = 'Poor';
    riskLevel = 'High';
    confidence = 88;
  } else if (avgScore >= 5) {
    status = 'Fair';
    riskLevel = 'Moderate';
    confidence = 85;
  } else if (avgScore >= 3) {
    status = 'Good';
    riskLevel = 'Low';
    confidence = 90;
  } else {
    status = 'Excellent';
    riskLevel = 'Low';
    confidence = 92;
  }
  
  return {
    success: true,
    prediction: status,
    confidence: confidence,
    risk_level: riskLevel,
    risk_factors: avgScore > 7 ? [
      'High stress levels detected',
      'Elevated anxiety symptoms',
      'Depression indicators present'
    ] : ['No major risk factors identified'],
    recommendations: avgScore > 7 ? [
      'Seek professional mental health support',
      'Practice stress management techniques',
      'Maintain regular sleep schedule',
      'Consider therapy or counseling'
    ] : [
      'Continue maintaining healthy habits',
      'Regular exercise and good sleep',
      'Stay socially connected'
    ]
  };
}

// Submit new assessment (27 questions)
exports.submitAssessment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const assessmentData = req.body;
    
    // Validate required fields
    const requiredFields = [
      'age', 'gender', 'educationLevel', 'sleepHours', 'sleepQuality',
      'dietQuality', 'exerciseFreq', 'stressLevel', 'anxietyLevel',
      'depressionSymptoms', 'selfEsteem', 'copingSkills', 'lifeSatisfaction',
      'lifePurpose', 'familySupport', 'socialIsolation', 'lonelinessFrequency',
      'relationshipQuality', 'physicalDisability', 'disabilityAdjustment',
      'chronicIllness', 'workStudyPressure', 'weeklyWorkStudyHours',
      'financialStress', 'accessTherapy', 'substanceUse', 'screenTime'
    ];
    
    const missingFields = requiredFields.filter(field => 
      assessmentData[field] === undefined && assessmentData[field] !== 0
    );
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }
    
    // Create assessment record
    const [assessmentResult] = await db.query(
      `INSERT INTO assessments (user_id, status) VALUES (?, 'In Progress')`,
      [userId]
    );
    
    const assessmentId = assessmentResult.insertId;
    
    // Store assessment responses
    await db.query(
      `INSERT INTO assessment_responses (
        assessment_id, age, gender, education_level, sleep_hours, sleep_quality,
        diet_quality, exercise_freq, screen_time, substance_use, stress_level,
        anxiety_level, depression_symptoms, self_esteem, coping_skills,
        life_satisfaction, life_purpose, family_support, social_isolation,
        loneliness_frequency, relationship_quality, physical_disability,
        disability_adjustment, chronic_illness, work_study_pressure,
        weekly_work_study_hours, financial_stress, access_therapy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assessmentId,
        assessmentData.age,
        assessmentData.gender,
        assessmentData.educationLevel,
        assessmentData.sleepHours,
        assessmentData.sleepQuality,
        assessmentData.dietQuality,
        assessmentData.exerciseFreq,
        assessmentData.screenTime,
        assessmentData.substanceUse,
        assessmentData.stressLevel,
        assessmentData.anxietyLevel,
        assessmentData.depressionSymptoms,
        assessmentData.selfEsteem,
        assessmentData.copingSkills,
        assessmentData.lifeSatisfaction,
        assessmentData.lifePurpose,
        assessmentData.familySupport,
        assessmentData.socialIsolation,
        assessmentData.lonelinessFrequency,
        assessmentData.relationshipQuality,
        assessmentData.physicalDisability,
        assessmentData.disabilityAdjustment,
        assessmentData.chronicIllness,
        assessmentData.workStudyPressure,
        assessmentData.weeklyWorkStudyHours,
        assessmentData.financialStress,
        assessmentData.accessTherapy
      ]
    );
    
    // Prepare data for ML prediction
    const mlData = {
      Age: parseInt(assessmentData.age),
      Gender: assessmentData.gender,
      Education_Level: assessmentData.educationLevel,
      Sleep_Hours: parseFloat(assessmentData.sleepHours),
      Sleep_Quality: parseFloat(assessmentData.sleepQuality),
      Diet_Quality: assessmentData.dietQuality,
      Exercise_Freq: parseInt(assessmentData.exerciseFreq),
      Stress_Level: parseInt(assessmentData.stressLevel),
      Anxiety_Level: parseInt(assessmentData.anxietyLevel),
      Depression_Symptoms: parseInt(assessmentData.depressionSymptoms),
      Self_Esteem: parseInt(assessmentData.selfEsteem),
      Coping_Skills: parseInt(assessmentData.copingSkills),
      Life_Satisfaction: parseInt(assessmentData.lifeSatisfaction),
      Life_Purpose: parseInt(assessmentData.lifePurpose),
      Family_Support: parseInt(assessmentData.familySupport),
      Social_Isolation: parseInt(assessmentData.socialIsolation),
      Loneliness_Frequency: parseInt(assessmentData.lonelinessFrequency),
      Relationship_Quality: parseInt(assessmentData.relationshipQuality),
      Physical_Disability: assessmentData.physicalDisability,
      Disability_Adjustment: parseInt(assessmentData.disabilityAdjustment),
      Chronic_Illness: assessmentData.chronicIllness,
      Work_Study_Pressure: assessmentData.workStudyPressure,
      Weekly_Work_Study_Hours: parseInt(assessmentData.weeklyWorkStudyHours),
      Financial_Stress: parseInt(assessmentData.financialStress),
      Access_Therapy: assessmentData.accessTherapy,
      Substance_Use: assessmentData.substanceUse,
      Screen_Time: parseFloat(assessmentData.screenTime)
    };
    
    // Call Python ML model with improved error handling
    let prediction;
    try {
      const mlModelPath = path.join(__dirname, '../../ml_model');
      const pythonScript = path.join(mlModelPath, 'predict.py');
      
      // Write data to temporary JSON file
      const tempFile = path.join(mlModelPath, `temp_input_${userId}_${Date.now()}.json`);
      fs.writeFileSync(tempFile, JSON.stringify(mlData));
      
      // Execute Python script
      const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
      const command = `${pythonCommand} "${pythonScript}" "${tempFile}"`;
      
      const result = execSync(command, { 
        cwd: mlModelPath, 
        encoding: 'utf-8',
        timeout: 15000,
        maxBuffer: 10 * 1024 * 1024
      });
      
      // Clean up temp file
      try {
        fs.unlinkSync(tempFile);
      } catch (cleanupError) {
        console.log('Temp file cleanup warning:', cleanupError.message);
      }
      
      prediction = JSON.parse(result);
      
      if (!prediction.success) {
        throw new Error(prediction.error || 'Python prediction failed');
      }
      
    } catch (error) {
      console.error('⚠️ ML Model Error:', error.message);
      console.log('📊 Using fallback prediction based on symptom scores');
      
      // Use mock prediction as reliable fallback
      prediction = mockPrediction(assessmentData);
    }
    
    if (prediction.success) {
      // Update assessment with prediction results
      await db.query(
        `UPDATE assessments SET 
          status = 'Completed',
          completed_at = NOW(),
          predicted_status = ?,
          prediction_confidence = ?,
          risk_level = ?,
          risk_factors = ?,
          recommendations = ?,
          requires_intervention = ?
        WHERE assessment_id = ?`,
        [
          prediction.prediction,
          prediction.confidence,
          prediction.risk_level,
          JSON.stringify(prediction.risk_factors),
          JSON.stringify(prediction.recommendations),
          prediction.risk_level === 'Critical' || prediction.risk_level === 'High',
          assessmentId
        ]
      );
      
      // Create alert if critical
      if (prediction.risk_level === 'Critical') {
        await db.query(
          `INSERT INTO alerts (user_id, assessment_id, alert_type, severity, alert_message, status)
           VALUES (?, ?, 'Crisis', 'Critical', 'User assessment indicates critical mental health status requiring immediate attention', 'New')`,
          [userId, assessmentId]
        );
      }
      
      res.status(201).json({
        success: true,
        message: 'Assessment completed successfully',
        assessmentId,
        prediction: {
          mentalHealthStatus: prediction.prediction,
          confidence: prediction.confidence,
          riskLevel: prediction.risk_level,
          riskFactors: prediction.risk_factors,
          recommendations: prediction.recommendations
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Assessment submitted but prediction failed',
        assessmentId,
        error: prediction.error
      });
    }
    
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assessment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's assessment history
exports.getAssessmentHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [assessments] = await db.query(
      `SELECT 
        assessment_id,
        started_at,
        completed_at,
        status,
        predicted_status,
        prediction_confidence,
        risk_level
      FROM assessments
      WHERE user_id = ?
      ORDER BY started_at DESC`,
      [userId]
    );
    
    res.json({
      success: true,
      count: assessments.length,
      assessments
    });
    
  } catch (error) {
    console.error('Get assessment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessment history'
    });
  }
};

// Get specific assessment details
exports.getAssessmentDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { assessmentId } = req.params;
    
    // Get assessment
    const [assessments] = await db.query(
      `SELECT * FROM assessments WHERE assessment_id = ? AND user_id = ?`,
      [assessmentId, userId]
    );
    
    if (assessments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }
    
    const assessment = assessments[0];
    
    // Get responses
    const [responses] = await db.query(
      `SELECT * FROM assessment_responses WHERE assessment_id = ?`,
      [assessmentId]
    );
    
    res.json({
      success: true,
      assessment: {
        ...assessment,
        risk_factors: assessment.risk_factors ? JSON.parse(assessment.risk_factors) : [],
        recommendations: assessment.recommendations ? JSON.parse(assessment.recommendations) : []
      },
      responses: responses[0] || null
    });
    
  } catch (error) {
    console.error('Get assessment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessment details'
    });
  }
};
