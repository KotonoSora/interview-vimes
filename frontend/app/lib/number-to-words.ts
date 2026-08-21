const DIGIT_WORDS = [
  "",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];
const GROUP_SCALES = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

function readGroup(threeDigits: number, showLeadingZero: boolean): string {
  const hundred = Math.floor(threeDigits / 100);
  const ten = Math.floor((threeDigits % 100) / 10);
  const unit = threeDigits % 10;
  let text = "";

  if (hundred > 0 || showLeadingZero) {
    text += `${DIGIT_WORDS[hundred]} trăm `;
  }

  if (ten > 1) {
    text += `${DIGIT_WORDS[ten]} mươi `;
    if (unit === 1) text += "mốt ";
    else if (unit === 5) text += "lăm ";
    else if (unit > 0) text += `${DIGIT_WORDS[unit]} `;
  } else if (ten === 1) {
    text += "mười ";
    if (unit === 5) text += "lăm ";
    else if (unit > 0) text += `${DIGIT_WORDS[unit]} `;
  } else if (ten === 0 && unit > 0) {
    if (hundred > 0 || showLeadingZero) text += "lẻ ";
    text += `${DIGIT_WORDS[unit]} `;
  }

  return text.trim();
}

export function convertNumberToVietnameseWords(amount: number): string {
  if (amount === 0) return "Không đồng";
  let num = Math.round(Math.abs(amount));
  const groups: number[] = [];

  while (num > 0) {
    groups.unshift(num % 1000);
    num = Math.floor(num / 1000);
  }

  let textResult = "";
  for (let i = 0; i < groups.length; i++) {
    const val = groups[i];
    const scale = GROUP_SCALES[groups.length - 1 - i];
    if (val > 0) {
      const readZero = i > 0;
      textResult += `${readGroup(val, readZero)} ${scale} `;
    }
  }

  const cleanText = textResult.trim().replace(/\s+/g, " ");
  return cleanText.charAt(0).toUpperCase() + cleanText.slice(1) + " đồng chẵn";
}
