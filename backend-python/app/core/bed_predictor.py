# app/core/bed_predictor.py

class BedPredictor:
    @staticmethod
    def predict_allocation(triage_score: float, age: int, comorbidities_count: int, spo2: float, heart_rate: float):
        """
        Determines the recommended bed type (ICU, HDU, General Ward, or Outpatient)
        based on clinical metrics and triage priority.
        """
        # Calculate a risk index (0 - 100) combining age, comorbidities and triage score
        age_risk = min(100.0, (age / 100.0) * 35.0)
        comorbidity_risk = min(100.0, comorbidities_count * 20.0)
        
        # Weighted risk calculation
        risk_index = (triage_score * 0.5) + (age_risk * 0.25) + (comorbidity_risk * 0.25)
        risk_index = round(min(100.0, max(0.0, risk_index)), 1)
        
        # Decide recommended bed and urgency
        if triage_score >= 75:
            bed_type = "ICU (Intensive Care Unit)"
            urgency = "High Emergency"
            rationale = f"Critical priority score ({triage_score}) requires continuous ventilation and cardiac monitoring."
        elif triage_score >= 50:
            if age > 65 or comorbidities_count >= 2:
                bed_type = "ICU (Intensive Care Unit)"
                urgency = "Emergency"
                rationale = f"Urgent triage score ({triage_score}) combined with high risk factors (Age {age}, Comorbidities: {comorbidities_count}) necessitates ICU admission."
            else:
                bed_type = "HDU (High Dependency Unit)"
                urgency = "High Priority"
                rationale = "Urgent status requires step-down intensive monitoring, but patient doesn't exhibit complex multi-system failure yet."
        elif triage_score >= 25:
            if age > 75 or comorbidities_count >= 3 or spo2 < 93:
                bed_type = "HDU (High Dependency Unit)"
                urgency = "Moderate Priority"
                rationale = f"Normal triage level, but age ({age}) or respiratory stress (SpO2 {spo2}%) warrants close monitoring in HDU."
            else:
                bed_type = "General Ward"
                urgency = "Routine Admittance"
                rationale = "Stable vitals and normal symptoms. Standard nursing care and medication monitoring."
        else:
            bed_type = "General Ward / Outpatient"
            urgency = "Low Priority"
            rationale = "Mild symptoms and healthy vitals. Recommend outpatient support or home isolation unless conditions worsen."

        return {
            "recommended_bed": bed_type,
            "urgency_level": urgency,
            "risk_index": risk_index,
            "rationale": rationale,
            "metrics": {
                "age_contribution": round(age_risk, 1),
                "comorbidity_contribution": round(comorbidity_risk, 1),
                "triage_contribution": round(triage_score * 0.5, 1)
            }
        }
