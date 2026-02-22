export interface ScheduleExceptionDto {
  id: string;
  startDate: string;
  endDate?: string;
  morningStart?: string;
  morningEnd?: string;
  afternoonStart?: string;
  afternoonEnd?: string;
}

export interface CreateScheduleExceptionDto {
  operatorId: string;
  startDate: string;
  endDate?: string;
  morningStart?: string;
  morningEnd?: string;
  afternoonStart?: string;
  afternoonEnd?: string;
}
