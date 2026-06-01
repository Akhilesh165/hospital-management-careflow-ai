# app/core/fuzzy_triage.py
import numpy as np

def trimf(x, a, b, c):
    """Triangular membership function."""
    if x <= a or x >= c:
        return 0.0
    if a < x <= b:
        return (x - a) / (b - a)
    if b < x < c:
        return (c - x) / (c - b)
    return 0.0

def trapmf(x, a, b, c, d):
    """Trapezoidal membership function."""
    if x <= a or x >= d:
        return 0.0
    if a < x < b:
        return (x - a) / (b - a)
    if b <= x <= c:
        return 1.0
    if c < x < d:
        return (d - x) / (d - c)
    return 0.0

class FuzzyTriageEngine:
    @staticmethod
    def evaluate_triage(heart_rate: float, spo2: float, temperature: float, symptom_severity: float):
        # 1. Fuzzification
        # Heart Rate [40, 180]
        hr_low = trapmf(heart_rate, 0, 0, 50, 60)
        hr_normal = trimf(heart_rate, 55, 75, 95)
        hr_high = trapmf(heart_rate, 90, 110, 180, 180)

        # SpO2 [70, 100]
        spo2_critical = trapmf(spo2, 0, 0, 85, 90)
        spo2_borderline = trimf(spo2, 88, 92, 95)
        spo2_normal = trapmf(spo2, 94, 96, 100, 100)

        # Temperature [95, 108]
        temp_low = trapmf(temperature, 0, 0, 96, 97.5)
        temp_normal = trimf(temperature, 97, 98.6, 99.8)
        temp_high = trapmf(temperature, 99.5, 101.5, 108, 108)

        # Symptom Severity [1, 10]
        symp_mild = trapmf(symptom_severity, 0, 0, 2, 4)
        symp_moderate = trimf(symptom_severity, 3, 5.5, 8)
        symp_severe = trapmf(symptom_severity, 7, 9, 10, 10)

        # 2. Rule Evaluation
        # Rule 1: If SpO2 is Critical, then Triage is Critical
        r1 = spo2_critical
        
        # Rule 2: If SpO2 is Borderline and Symptom is Severe, then Triage is Critical
        r2 = min(spo2_borderline, symp_severe)
        
        # Rule 3: If Heart Rate is High and Temp is High and Symptom is Severe, then Triage is Critical
        r3 = min(hr_high, temp_high, symp_severe)
        
        # Rule 4: If SpO2 is Normal and Temp is Normal and Symptom is Mild, then Triage is Stable
        r4 = min(spo2_normal, temp_normal, symp_mild)
        
        # Rule 5: If SpO2 is Normal and Temp is Normal and Symptom is Moderate, then Triage is Normal
        r5 = min(spo2_normal, temp_normal, symp_moderate)
        
        # Rule 6: If SpO2 is Normal and (Temp is High or Heart Rate is High or HR is Low) and Symptom is Moderate, then Triage is Urgent
        r6 = min(spo2_normal, max(temp_high, max(hr_high, hr_low)), symp_moderate)
        
        # Rule 7: If SpO2 is Borderline and Symptom is Moderate, then Triage is Urgent
        r7 = min(spo2_borderline, symp_moderate)
        
        # Rule 8: If Temp is High and Symptom is Severe, then Triage is Urgent
        r8 = min(temp_high, symp_severe)
        
        # Rule 9: If SpO2 is Borderline and Temp is High, then Triage is Critical
        r9 = min(spo2_borderline, temp_high)
        
        # Rule 10: If Heart Rate is High and SpO2 is Borderline, then Triage is Critical
        r10 = min(hr_high, spo2_borderline)

        # 3. Rule Aggregation
        out_critical = max(r1, r2, r3, r9, r10)
        out_urgent = max(r6, r7, r8)
        out_normal = r5
        out_stable = r4

        # 4. Defuzzification (Centroid Method)
        # Discretize the output variable "triage score" from 0 to 100
        y_values = np.linspace(0, 100, 101)
        agg_values = []
        
        for y_val in y_values:
            # Define output fuzzy membership values for this specific output score
            val_stable = trapmf(y_val, 0, 0, 15, 30)
            val_normal = trimf(y_val, 20, 45, 65)
            val_urgent = trimf(y_val, 55, 75, 90)
            val_critical = trapmf(y_val, 80, 92, 100, 100)

            # Apply clipping (min with rule strength) and aggregation (max)
            m_stable = min(out_stable, val_stable)
            m_normal = min(out_normal, val_normal)
            m_urgent = min(out_urgent, val_urgent)
            m_critical = min(out_critical, val_critical)

            agg_val = max(m_stable, m_normal, m_urgent, m_critical)
            agg_values.append(agg_val)

        # Calculate centroid
        sum_agg_y = sum(y_values * agg_values)
        sum_agg = sum(agg_values)

        if sum_agg == 0:
            # Default to a safe neutral score based on inputs if rules did not fire cleanly
            if spo2 < 90:
                triage_score = 85.0
            elif symptom_severity > 7:
                triage_score = 70.0
            else:
                triage_score = 35.0
        else:
            triage_score = float(sum_agg_y / sum_agg)

        # Determine clinical recommendation
        if triage_score >= 75:
            category = "Critical"
            recommendation = "Immediate ICU/Emergency admission needed. Call Code Red."
        elif triage_score >= 50:
            category = "Urgent"
            recommendation = "Urgent Care Unit. Fast-track doctor examination within 15 minutes."
        elif triage_score >= 25:
            category = "Normal"
            recommendation = "Standard consulting queue. Examination within 1-2 hours."
        else:
            category = "Stable"
            recommendation = "Outpatient support or home recovery. Routine consultation."

        return {
            "score": round(triage_score, 1),
            "category": category,
            "recommendation": recommendation,
            "membership_degrees": {
                "inputs": {
                    "heart_rate": {"low": round(hr_low, 2), "normal": round(hr_normal, 2), "high": round(hr_high, 2)},
                    "spo2": {"critical": round(spo2_critical, 2), "borderline": round(spo2_borderline, 2), "normal": round(spo2_normal, 2)},
                    "temperature": {"low": round(temp_low, 2), "normal": round(temp_normal, 2), "high": round(temp_high, 2)},
                    "symptoms": {"mild": round(symp_mild, 2), "moderate": round(symp_moderate, 2), "severe": round(symp_severe, 2)}
                },
                "outputs": {
                    "stable": round(out_stable, 2),
                    "normal": round(out_normal, 2),
                    "urgent": round(out_urgent, 2),
                    "critical": round(out_critical, 2)
                }
            }
        }
