from dataclasses import dataclass
from typing import List, Optional

@dataclass
class patientForm:
    name: str
    age: int
    symptoms: List[str]
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None

    def custom_validation(self) -> List[str]:
        errors = []
        is_age_valid = True

        # Required fields
        if not self.name:
            errors.append("Name is required.")
        if self.age is None:
            errors.append("Age is required.")
        if not self.symptoms:
            errors.append("Symptoms are required.")

        # Type checks
        if not isinstance(self.name, str):
            errors.append("Name must be a string.")
        if not isinstance(self.age, int):
            is_age_valid = False
            errors.append("Age must be an integer.")
        if not isinstance(self.symptoms, list) or not all(isinstance(s, str) for s in self.symptoms):
            errors.append("Symptoms must be a list of strings.")
        if self.diagnosis is not None and not isinstance(self.diagnosis, str):
            errors.append("Diagnosis must be a string if provided.")
        if self.treatment_plan is not None and not isinstance(self.treatment_plan, str):
            errors.append("Treatment plan must be a string if provided.")

        # Custom validation
        if is_age_valid:
            if self.age < 0 or self.age > 120:
                errors.append("Age must be between 0 and 120.")

        return errors