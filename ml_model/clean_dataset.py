import pandas as pd
import numpy as np

# Load the HIGH-QUALITY 5000-row dataset
print("Loading HIGH-QUALITY dataset (5000 rows)...")
df = pd.read_csv('dataset/mental_health_dataset_balanced_5000.csv')

print(f"Original dataset: {len(df)} rows, {len(df.columns)} columns")

# Fill missing Substance_Use values with 'None'
missing_before = df['Substance_Use'].isnull().sum()
df['Substance_Use'] = df['Substance_Use'].fillna('None')
missing_after = df['Substance_Use'].isnull().sum()

print(f"Fixed Substance_Use: {missing_before} missing → {missing_after} missing")

# Save cleaned dataset
df.to_csv('dataset/mental_health_cleaned.csv', index=False)
print(f"✅ Cleaned dataset saved: dataset/mental_health_cleaned.csv")

# Display summary
print("\n" + "="*60)
print("DATASET SUMMARY")
print("="*60)
print(f"Total Records: {len(df)}")
print(f"Total Features: {len(df.columns) - 1}")
print(f"\nMental Health Status Distribution:")
print(df['Mental_Health_Status'].value_counts())
print(f"\nPhysical Disability Distribution:")
print(df['Physical_Disability'].value_counts())
print("\n✅ Dataset ready for ML model training!")
