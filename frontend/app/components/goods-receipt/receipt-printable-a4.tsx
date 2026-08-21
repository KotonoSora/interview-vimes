interface ReceiptPrintableA4Props {
  receipt: {
    receiptNumber: string;
    receiptDate: string;
    actualReceivedDate?: string;
    organization?: { name: string; department: string };
    warehouse?: { name: string; location: string };
    delivererName: string;
    docReference?: string;
    docDate?: string;
    docOrigin?: string;
    debitAccount?: string;
    creditAccount?: string;
    totalAmount?: number;
    totalAmountWords?: string;
    attachedDocCount?: string;
    signatures?: {
      creatorName?: string;
      storekeeperName?: string;
      chiefAccountantName?: string;
    };
    items?: Array<{
      lineNo?: number;
      productCode?: string;
      productName: string;
      unit: string;
      docQty: number;
      actualQty: number;
      unitPrice: number;
      amount: number;
    }>;
  };
}

export function ReceiptPrintableA4({ receipt }: ReceiptPrintableA4Props) {
  const dateObj = receipt.receiptDate
    ? new Date(receipt.receiptDate)
    : new Date();
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  return (
    <div className="bg-white text-black p-8 max-w-[210mm] mx-auto text-[13px] leading-normal font-serif print:p-0 print:m-0 print:max-w-none print:shadow-none shadow-md rounded border">
      {/* Header Document */}
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <div className="font-bold text-sm uppercase">
            {receipt.organization?.name || "CÔNG TY CỔ PHẦN VIMES"}
          </div>
          <div className="text-xs">
            Bộ phận:{" "}
            {receipt.organization?.department || "Kế toán - Quản lý Vật tư"}
          </div>
        </div>
        <div className="text-center text-xs">
          <div className="font-bold">Mẫu số: 01 - VT</div>
          <div>(Ban hành theo TT số 200/2014/TT-BTC</div>
          <div>ngày 22/12/2014 của Bộ Tài chính)</div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center my-4 space-y-1">
        <h1 className="text-xl font-bold uppercase tracking-wide">
          PHIẾU NHẬP KHO
        </h1>
        <div className="italic text-xs">
          Ngày {day} tháng {month} năm {year}
        </div>
        <div className="font-semibold text-xs">Số: {receipt.receiptNumber}</div>
        <div className="flex justify-center gap-6 text-xs mt-1">
          <span>Nợ: {receipt.debitAccount || "152"}</span>
          <span>Có: {receipt.creditAccount || "331"}</span>
        </div>
      </div>

      {/* Thông tin người giao */}
      <div className="space-y-1.5 my-4 text-xs">
        <div>
          - Họ và tên người giao: <strong>{receipt.delivererName}</strong>
        </div>
        <div>
          - Theo{" "}
          {receipt.docReference
            ? `số ${receipt.docReference}`
            : "hóa đơn/lệnh số:"}{" "}
          {receipt.docDate ? `ngày ${receipt.docDate}` : ""} của{" "}
          {receipt.docOrigin || "..."}
        </div>
        <div>
          - Nhập tại kho: <strong>{receipt.warehouse?.name}</strong>. Địa điểm:{" "}
          {receipt.warehouse?.location || "..."}
        </div>
      </div>

      {/* Bảng chi tiết vật tư */}
      <table className="w-full border-collapse border border-black my-4 text-xs">
        <thead>
          <tr className="bg-gray-100 text-center font-semibold">
            <th className="border border-black p-1 w-8" rowSpan={2}>
              STT
            </th>
            <th className="border border-black p-1" rowSpan={2}>
              Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm,
              hàng hóa
            </th>
            <th className="border border-black p-1 w-16" rowSpan={2}>
              Mã số
            </th>
            <th className="border border-black p-1 w-12" rowSpan={2}>
              ĐVT
            </th>
            <th className="border border-black p-1" colSpan={2}>
              Số lượng
            </th>
            <th className="border border-black p-1 w-20" rowSpan={2}>
              Đơn giá
            </th>
            <th className="border border-black p-1 w-24" rowSpan={2}>
              Thành tiền
            </th>
          </tr>
          <tr className="bg-gray-50 text-center">
            <th className="border border-black p-1 w-16">Theo C.từ</th>
            <th className="border border-black p-1 w-16">Thực nhập</th>
          </tr>
          <tr className="text-center italic text-[11px]">
            <td className="border border-black p-0.5">A</td>
            <td className="border border-black p-0.5">B</td>
            <td className="border border-black p-0.5">C</td>
            <td className="border border-black p-0.5">D</td>
            <td className="border border-black p-0.5">1</td>
            <td className="border border-black p-0.5">2</td>
            <td className="border border-black p-0.5">3</td>
            <td className="border border-black p-0.5">4</td>
          </tr>
        </thead>
        <tbody>
          {receipt.items?.map((item, idx) => (
            <tr key={idx}>
              <td className="border border-black p-1 text-center">{idx + 1}</td>
              <td className="border border-black p-1">{item.productName}</td>
              <td className="border border-black p-1 text-center">
                {item.productCode || "—"}
              </td>
              <td className="border border-black p-1 text-center">
                {item.unit}
              </td>
              <td className="border border-black p-1 text-right">
                {item.docQty}
              </td>
              <td className="border border-black p-1 text-right font-semibold">
                {item.actualQty}
              </td>
              <td className="border border-black p-1 text-right">
                {new Intl.NumberFormat("vi-VN").format(item.unitPrice)}
              </td>
              <td className="border border-black p-1 text-right font-semibold">
                {new Intl.NumberFormat("vi-VN").format(item.amount)}
              </td>
            </tr>
          ))}
          <tr>
            <td
              colSpan={7}
              className="border border-black p-1 font-bold text-center"
            >
              Cộng
            </td>
            <td className="border border-black p-1 text-right font-bold">
              {new Intl.NumberFormat("vi-VN").format(receipt.totalAmount || 0)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tổng tiền chữ & Chứng từ */}
      <div className="space-y-1 my-3 text-xs">
        <div>
          - Tổng số tiền (viết bằng chữ): <em>{receipt.totalAmountWords}</em>
        </div>
        <div>- Số chứng từ gốc kèm theo: {receipt.attachedDocCount || "0"}</div>
      </div>

      {/* Khối chữ ký 4 bên */}
      <div className="grid grid-cols-4 text-center mt-8 gap-2 text-xs">
        <div>
          <div className="font-bold">Người lập phiếu</div>
          <div className="italic text-[10px]">(Ký, họ tên)</div>
          <div className="mt-16 font-semibold">
            {receipt.signatures?.creatorName || "Lê Văn Lập"}
          </div>
        </div>
        <div>
          <div className="font-bold">Người giao hàng</div>
          <div className="italic text-[10px]">(Ký, họ tên)</div>
          <div className="mt-16 font-semibold">{receipt.delivererName}</div>
        </div>
        <div>
          <div className="font-bold">Thủ kho</div>
          <div className="italic text-[10px]">(Ký, họ tên)</div>
          <div className="mt-16 font-semibold">
            {receipt.signatures?.storekeeperName || "Trần Văn Kho"}
          </div>
        </div>
        <div>
          <div className="font-bold">Kế toán trưởng</div>
          <div className="italic text-[10px]">
            (Hoặc bộ phận có nhu cầu nhập)
          </div>
          <div className="mt-16 font-semibold">
            {receipt.signatures?.chiefAccountantName || "Phạm Thị Trưởng"}
          </div>
        </div>
      </div>
    </div>
  );
}
