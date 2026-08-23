import { Link, useSearchParams } from "react-router";
import type { GoodsReceiptListItem } from "~/services/receipt.service";
import { RECEIPT_TYPE_LABELS, RECEIPT_STATUS_LABELS } from "~/constants/receipt.constants";
import { formatCurrencyVND, formatDateVN } from "~/lib/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Inbox,
  Pencil,
} from "lucide-react";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Props {
  receipts: GoodsReceiptListItem[];
  pagination: PaginationMeta;
}

export function ReceiptTable({ receipts, pagination }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams, { preventScrollReset: true });
  };

  const getStatusBadge = (status?: string | null) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-semibold">
            {RECEIPT_STATUS_LABELS.CONFIRMED}
          </Badge>
        );
      case "DRAFT":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold">
            {RECEIPT_STATUS_LABELS.DRAFT}
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 text-xs font-semibold">
            {RECEIPT_STATUS_LABELS.CANCELLED}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "—"}</Badge>;
    }
  };

  const getReceiptTypeLabel = (type?: string | null) => {
    if (!type) return "—";
    const labels = RECEIPT_TYPE_LABELS as Record<string, string>;
    return labels[type] || type;
  };

  if (receipts.length === 0) {
    return (
      <Card className="shadow-sm border">
        <CardContent className="p-12 text-center flex flex-col items-center justify-center">
          <div className="p-3 bg-muted rounded-full mb-3 text-muted-foreground">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-foreground">Không tìm thấy chứng từ nào</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Thử thay đổi bộ lọc tìm kiếm hoặc tạo mới một phiếu nhập kho để bắt đầu quản lý.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border overflow-hidden">
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs font-semibold">
              <TableHead className="w-12 text-center">STT</TableHead>
              <TableHead className="min-w-[140px]">Số phiếu</TableHead>
              <TableHead className="min-w-[110px]">Ngày lập</TableHead>
              <TableHead className="min-w-[150px]">Loại nghiệp vụ</TableHead>
              <TableHead className="min-w-[200px]">Đơn vị / Kho tiếp nhận</TableHead>
              <TableHead className="min-w-[160px]">Người giao hàng</TableHead>
              <TableHead className="min-w-[140px] text-right">Tổng tiền (VNĐ)</TableHead>
              <TableHead className="w-28 text-center">Trạng thái</TableHead>
              <TableHead className="w-24 text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((rc, idx) => {
              const rowNumber = (pagination.page - 1) * pagination.limit + idx + 1;
              const orgName = (rc as any).organization?.name || (rc as any).organizationName || "Đơn vị";
              const whName = rc.warehouse?.name || (rc as any).warehouseName || "Kho";

              return (
                <TableRow key={rc.id} className="hover:bg-muted/20 group">
                  <TableCell className="text-center text-xs font-medium text-muted-foreground">
                    {rowNumber}
                  </TableCell>

                  <TableCell>
                    <Link
                      to={`/goods-receipts/${rc.id}`}
                      className="font-mono font-bold text-sm text-primary hover:underline flex items-center gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                      {rc.receiptNumber}
                    </Link>
                    {rc.docReference && (
                      <span className="text-[11px] text-muted-foreground block truncate">
                        Gốc: {rc.docReference}
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="font-mono text-xs text-foreground">
                    {formatDateVN(rc.receiptDate)}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {getReceiptTypeLabel(rc.receiptType)}
                  </TableCell>

                  <TableCell className="text-xs">
                    <div className="font-medium text-foreground truncate">{orgName}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{whName}</div>
                  </TableCell>

                  <TableCell className="text-xs text-foreground font-medium">
                    {rc.delivererName || "—"}
                  </TableCell>

                  <TableCell className="text-right font-mono font-bold text-sm text-foreground whitespace-nowrap">
                    {formatCurrencyVND(rc.totalAmount || 0)}
                  </TableCell>

                  <TableCell className="text-center">
                    {getStatusBadge(rc.status)}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link to={`/goods-receipts/${rc.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {rc.status !== "CANCELLED" && (
                        <Link to={`/goods-receipts/${rc.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="p-3 bg-muted/20 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div>
          Hiển thị <span className="font-semibold text-foreground">{receipts.length}</span> /{" "}
          <span className="font-semibold text-foreground">{pagination.total}</span> chứng từ (Trang {pagination.page}/{pagination.totalPages || 1})
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="h-8 text-xs px-2.5"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Trước
          </Button>
          <span className="px-2 font-mono font-medium text-foreground">
            {pagination.page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
            className="h-8 text-xs px-2.5"
          >
            Sau <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
