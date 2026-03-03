import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function pastDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const inputDate = new Date(value);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return inputDate < today ? null : { notInPast: true };
  };
}
