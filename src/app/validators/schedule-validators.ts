import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export class ScheduleValidators {
  static step30Min(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const minutes = parseInt(control.value.split(':')[1], 10);
      return (minutes === 0 || minutes === 30) ? null : { invalidStep: true };
    };
  }

  static timeRange(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const start = group.get('start')?.value;
      const end = group.get('end')?.value;
      if (!start || !end) return null;
      return start < end ? null : { invalidRange: true };
    };
  }

  static amPmOverlap(): ValidatorFn {
    return (array: AbstractControl): ValidationErrors | null => {
      const slots = (array as any).value;
      const am = slots.find((s: any) => s.type === 'AM');
      const pm = slots.find((s: any) => s.type === 'PM');

      if (am?.end && pm?.start) {
        if (pm.start < am.end) return { overlap: true };
      }
      return null;
    };
  }
}
