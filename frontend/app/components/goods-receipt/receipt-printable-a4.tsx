import type { GoodsReceiptDetail } from "~/services/receipt.service";

import { formatCurrencyVND } from "~/lib/formatters";

export function ReceiptPrintableA4({
  receipt,
}: {
  receipt: GoodsReceiptDetail;
}) {
  const items = receipt.items || [];
  return (
    <div className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-[297mm] shadow-sm border print:border-none print:shadow-none font-serif text-xs leading-normal">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-bold uppercase text-[11px]">
            {receipt.organization?.name || "ĐƠN VỊ CHỦ QUẢN"}
          </p>
          <p className="italic">
            {receipt.organization?.department || "Bộ phận Vật tư"}
          </p>
        </div>
        <div className="text-center text-[10px]">
          <p className="font-bold text-xs">Mẫu số 01 - VT</p>
          <p className="italic">(Ban hành theo TT số 200/2014/TT-BTC</p>
          <p className="italic">ngày 22/12/2014 của Bộ Tài chính)</p>
        </div>
      </div>

      <div className="text-center my-3">
        <h1 className="text-base font-bold uppercase">PHIẾU NHẬP KHO</h1>
        <p className="italic text-[11px]">Ngày {receipt.receiptDate}</p>
        <p className="font-semibold text-[11px]">Số: {receipt.receiptNumber}</p>
      </div>

      <div className="flex justify-end gap-4 font-mono text-[11px] mb-2">
        <p>
          Nợ: <span className="font-bold">{receipt.debitAccount || "152"}</span>
        </p>
        <p>
          Có:{" "}
          <span className="font-bold">{receipt.creditAccount || "331"}</span>
        </p>
      </div>

      <div className="space-y-1 mb-3">
        <p>
          - Họ và tên người giao:{" "}
          <span className="font-semibold">{receipt.delivererName}</span>
        </p>
        <p>
          - Theo chứng từ:{" "}
          <span>
            {receipt.docReference || "—"}{" "}
            {receipt.docOrigin ? `(${receipt.docOrigin})` : ""}
          </span>
        </p>
        <p>
          - Nhập tại kho:{" "}
          <span className="font-semibold">
            {receipt.warehouse?.name || "—"}
          </span>{" "}
          {receipt.warehouse?.location
            ? `- Địa điểm: ${receipt.warehouse.location}`
            : ""}
        </p>
        {receipt.description && (
          <p>
            - Diễn giải: <span>{receipt.description}</span>
          </p>
        )}
      </div>

      <table className="w-full border-collapse border border-black my-2">
        <thead>
          <tr className="text-center font-semibold bg-gray-50">
            <th className="border border-black p-1 w-8">STT</th>
            <th className="border border-black p-1">
              Tên, nhãn hiệu, quy cách vật tư
            </th>
            <th className="border border-black p-1 w-12">ĐVT</th>
            <th className="border border-black p-1 w-16">SL C.Từ</th>
            <th className="border border-black p-1 w-16">SL Thực</th>
            <th className="border border-black p-1 w-20">Đơn giá</th>
            <th className="border border-black p-1 w-24">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={it.id || idx}>
              <td className="border border-black p-1 text-center">{idx + 1}</td>
              <td className="border border-black p-1">{it.productName}</td>
              <td className="border border-black p-1 text-center">{it.unit}</td>
              <td className="border border-black p-1 text-right">
                {it.docQty}
              </td>
              <td className="border border-black p-1 text-right font-semibold">
                {it.actualQty}
              </td>
              <td className="border border-black p-1 text-right">
                {formatCurrencyVND(it.unitPrice)}
              </td>
              <td className="border border-black p-1 text-right font-semibold">
                {formatCurrencyVND(it.amount || it.actualQty * it.unitPrice)}
              </td>
            </tr>
          ))}
          <tr className="font-bold">
            <td
              colSpan={6}
              className="border border-black p-1 text-center uppercase"
            >
              Tổng cộng
            </td>
            <td className="border border-black p-1 text-right">
              {formatCurrencyVND(receipt.totalAmount || 0)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="my-3">
        <p>
          - Tổng số tiền (viết bằng chữ):{" "}
          <span className="font-semibold italic">
            {receipt.totalAmountWords || "—"}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center mt-6">
        <div>
          <p className="font-bold">Người lập phiếu</p>
          <div className="h-14" />
          <p className="font-semibold">
            {receipt.signatures?.creatorName || "Lê Văn Lập"}
          </p>
        </div>
        <div>
          <p className="font-bold">Người giao hàng</p>
          <div className="h-14" />
          <p className="font-semibold">{receipt.delivererName}</p>
        </div>
        <div>
          <p className="font-bold">Thủ kho</p>
          <div className="h-14" />
          <p className="font-semibold">
            {receipt.signatures?.storekeeperName || "Trần Văn Kho"}
          </p>
        </div>
        <div>
          <p className="font-bold">Kế toán trưởng</p>
          <div className="h-14" />
          <p className="font-semibold">
            {receipt.signatures?.chiefAccountantName || "Phạm Thị Trưởng"}
          </p>
        </div>
      </div>
    </div>
  );
}
