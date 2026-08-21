import type { GoodsReceiptDetail } from "~/services/receipt.service";

import { formatCurrencyVND } from "~/lib/formatters";

export interface ReceiptPrintableA4Props {
  receipt: GoodsReceiptDetail;
}

export function ReceiptPrintableA4({ receipt }: ReceiptPrintableA4Props) {
  const items = receipt.items || [];
  const totalAmount = receipt.totalAmount || 0;

  return (
    <div className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-[297mm] shadow-sm border print:border-none print:shadow-none font-serif leading-normal text-sm">
      {/* Header Thông tư 200 */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="font-bold text-xs uppercase">
            {receipt.organization?.name || "ĐƠN VỊ CHỦ QUẢN"}
          </p>
          <p className="text-xs italic">
            {receipt.organization?.department || "Phòng Quản lý Vật tư"}
          </p>
        </div>
        <div className="text-center text-xs">
          <p className="font-bold">Mẫu số 01 - VT</p>
          <p className="italic text-[11px]">
            (Ban hành theo TT số 200/2014/TT-BTC
          </p>
          <p className="italic text-[11px]">
            ngày 22/12/2014 của Bộ Tài chính)
          </p>
        </div>
      </div>

      {/* Title */}
      <div className="text-center my-4 space-y-1">
        <h1 className="text-lg font-bold uppercase tracking-wide">
          PHIẾU NHẬP KHO
        </h1>
        <p className="text-xs italic">
          Ngày {receipt.receiptDate?.split("-")[2] || "..."} tháng{" "}
          {receipt.receiptDate?.split("-")[1] || "..."} năm{" "}
          {receipt.receiptDate?.split("-")[0] || "..."}
        </p>
        <p className="text-xs font-semibold">Số: {receipt.receiptNumber}</p>
      </div>

      {/* Accounting & Origin Header */}
      <div className="flex justify-end gap-6 text-xs mb-3 font-mono">
        <p>
          Nợ: <span className="font-bold">{receipt.debitAccount || "152"}</span>
        </p>
        <p>
          Có:{" "}
          <span className="font-bold">{receipt.creditAccount || "331"}</span>
        </p>
      </div>

      {/* General Information */}
      <div className="space-y-1.5 text-xs mb-4">
        <div className="flex">
          <span className="w-48 font-medium">- Họ và tên người giao:</span>
          <span className="font-semibold">{receipt.delivererName}</span>
        </div>
        <div className="flex">
          <span className="w-48 font-medium">
            - Theo{" "}
            {receipt.docReference
              ? `chứng từ số ${receipt.docReference}`
              : "chứng từ gốc"}
            :
          </span>
          <span>
            {receipt.docDate ? `ngày ${receipt.docDate}` : ""}{" "}
            {receipt.docOrigin ? `của ${receipt.docOrigin}` : ""}
          </span>
        </div>
        <div className="flex">
          <span className="w-48 font-medium">- Nhập tại kho:</span>
          <span>
            {receipt.warehouse?.name || "—"}{" "}
            {receipt.warehouse?.location
              ? `(Địa điểm: ${receipt.warehouse.location})`
              : ""}
          </span>
        </div>
        {receipt.description && (
          <div className="flex">
            <span className="w-48 font-medium">- Diễn giải / Lý do:</span>
            <span>{receipt.description}</span>
          </div>
        )}
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse border border-black text-xs my-4">
        <thead>
          <tr className="text-center font-semibold bg-gray-50">
            <th rowSpan={2} className="border border-black p-1 w-10">
              STT
            </th>
            <th rowSpan={2} className="border border-black p-1">
              Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm,
              hàng hóa
            </th>
            <th rowSpan={2} className="border border-black p-1 w-16">
              Mã số
            </th>
            <th rowSpan={2} className="border border-black p-1 w-14">
              ĐVT
            </th>
            <th colSpan={2} className="border border-black p-1">
              Số lượng
            </th>
            <th rowSpan={2} className="border border-black p-1 w-24">
              Đơn giá (VNĐ)
            </th>
            <th rowSpan={2} className="border border-black p-1 w-28">
              Thành tiền (VNĐ)
            </th>
          </tr>
          <tr className="text-center font-semibold bg-gray-50">
            <th className="border border-black p-1 w-16">Chứng từ</th>
            <th className="border border-black p-1 w-16">Thực nhập</th>
          </tr>
          <tr className="text-center italic text-[11px] bg-gray-100">
            <td className="border border-black p-0.5">A</td>
            <td className="border border-black p-0.5">B</td>
            <td className="border border-black p-0.5">C</td>
            <td className="border border-black p-0.5">D</td>
            <td className="border border-black p-0.5">1</td>
            <td className="border border-black p-0.5">2</td>
            <td className="border border-black p-0.5">3</td>
            <td className="border border-black p-0.5">4 = 2 x 3</td>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={it.id || idx}>
              <td className="border border-black p-1 text-center">
                {it.lineNo || idx + 1}
              </td>
              <td className="border border-black p-1">{it.productName}</td>
              <td className="border border-black p-1 text-center font-mono">
                {it.productCode || "—"}
              </td>
              <td className="border border-black p-1 text-center">{it.unit}</td>
              <td className="border border-black p-1 text-right">
                {it.docQty}
              </td>
              <td className="border border-black p-1 text-right font-medium">
                {it.actualQty}
              </td>
              <td className="border border-black p-1 text-right">
                {formatCurrencyVND(it.unitPrice)}
              </td>
              <td className="border border-black p-1 text-right font-medium">
                {formatCurrencyVND(it.amount || it.actualQty * it.unitPrice)}
              </td>
            </tr>
          ))}
          <tr className="font-semibold">
            <td
              colSpan={7}
              className="border border-black p-1.5 text-center uppercase"
            >
              Cộng
            </td>
            <td className="border border-black p-1.5 text-right font-bold">
              {formatCurrencyVND(totalAmount)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Words and docs */}
      <div className="space-y-1 text-xs mb-8">
        <p>
          - Tổng số tiền (viết bằng chữ):{" "}
          <span className="font-semibold italic">
            {receipt.totalAmountWords || "—"}
          </span>
        </p>
        <p>
          - Số chứng từ gốc kèm theo:{" "}
          <span>{receipt.attachedDocCount || "01"}</span>
        </p>
      </div>

      {/* Signatures 4 roles */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs mt-6">
        <div className="space-y-1">
          <p className="font-bold">Người lập phiếu</p>
          <p className="italic text-[11px]">(Ký, họ tên)</p>
          <div className="h-16"></div>
          <p className="font-semibold">
            {receipt.signatures?.creatorName || "Lê Văn Lập"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-bold">Người giao hàng</p>
          <p className="italic text-[11px]">(Ký, họ tên)</p>
          <div className="h-16"></div>
          <p className="font-semibold">{receipt.delivererName}</p>
        </div>
        <div className="space-y-1">
          <p className="font-bold">Thủ kho</p>
          <p className="italic text-[11px]">(Ký, họ tên)</p>
          <div className="h-16"></div>
          <p className="font-semibold">
            {receipt.signatures?.storekeeperName || "Trần Văn Kho"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-bold">Kế toán trưởng</p>
          <p className="italic text-[11px]">(Ký, họ tên)</p>
          <div className="h-16"></div>
          <p className="font-semibold">
            {receipt.signatures?.chiefAccountantName || "Phạm Thị Trưởng"}
          </p>
        </div>
      </div>
    </div>
  );
}
