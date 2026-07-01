export function calculateBmi(heightCm: number | null | undefined, weightKg: number | null | undefined) {
  if (!heightCm || !weightKg || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  return Math.round(bmi * 100) / 100;
}

export function bmiCategory(bmi: number | null) {
  if (bmi === null) {
    return null;
  }

  if (bmi < 18.5) {
    return 'underweight';
  }

  if (bmi < 25) {
    return 'normal';
  }

  if (bmi < 30) {
    return 'overweight';
  }

  return 'obese';
}
