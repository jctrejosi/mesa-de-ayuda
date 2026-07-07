export class AttendanceStatsDto {
  present!: {
    today: number;
    yesterday: number;
  };
  pending!: {
    today: number;
    yesterday: number;
  };
  late!: {
    today: number;
    yesterday: number;
  };
}
