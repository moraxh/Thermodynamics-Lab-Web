const monthsES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export const getMonthName = (month: number): string => {
  if (month < 1 || month > 12) {
    throw new Error("Invalid month number");
  }
  return monthsES[month - 1];
}