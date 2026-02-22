import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const scheduleInfoValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const morningStart = control.get('morningStart')?.value;
  const morningEnd = control.get('morningEnd')?.value;
  const afternoonStart = control.get('afternoonStart')?.value;
  const afternoonEnd = control.get('afternoonEnd')?.value;

  const errors: any = {};

  const isScheduleValid = (start: string, end: string) => {
    if (!start && !end) return true;
    if (start && end) return start <= end;
    return false;
  };

  const isMorningValid = isScheduleValid(morningStart, morningEnd);
  const isAfternoonValid = isScheduleValid(afternoonStart, afternoonEnd);

  if (!isMorningValid) {
    errors.invalidMorning = 'L\'orario di fine mattina deve essere successivo all\'inizio.';
  }

  if (!isAfternoonValid) {
    errors.invalidAfternoon = 'L\'orario di fine pomeriggio deve essere successivo all\'inizio.';
  }

  if (morningEnd && afternoonStart) {
    if (afternoonStart <= morningEnd) {
      errors.overlap = 'Il pomeriggio non può iniziare prima o contemporaneamente alla fine della mattina.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return errors;
  }

  return null;
};

export const periodValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;

  if (!startDate) {
    return { invalidPeriod: 'La data di inizio è obbligatoria.' };
  }

  if (endDate && endDate < startDate) {
    return { invalidPeriod: 'La data di fine non può essere precedente a quella di inizio.' };
  }

  return null;
};
