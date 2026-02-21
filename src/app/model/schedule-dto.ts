export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export interface StandardScheduleDto {
  id: string;
  day: DayOfWeek;
  morningStart: string | null;
  morningEnd: string | null;
  afternoonStart: string | null;
  afternoonEnd: string | null;
}

export interface ScheduleAbstract {
  morningStart?: string | null;
  morningEnd?: string | null;
  afternoonStart?: string | null;
  afternoonEnd?: string | null;
  operatorId: string;
}

export interface CreateStandardScheduleDto extends ScheduleAbstract {
  day: DayOfWeek;
}

export interface UpdateStandardScheduleDto extends ScheduleAbstract {
  id: string;
}
