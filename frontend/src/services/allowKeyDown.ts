export const allowOnlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (
    ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)
  ) return;

  if (!/[\d.-]/.test(e.key)) {
    e.preventDefault();
  }

  if (e.key === "." && e.currentTarget.value.includes(".")) {
    e.preventDefault();
  }

  if (e.key === "-" && e.currentTarget.selectionStart !== 0) {
    e.preventDefault();
  }
};