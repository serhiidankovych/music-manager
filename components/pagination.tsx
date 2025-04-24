import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageButtons = () => {
    const buttons = [];

    buttons.push(
      <Button
        key="page-1"
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        className="w-8 h-8"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        1
      </Button>
    );

    if (totalPages <= 7) {
      for (let i = 2; i < totalPages; i++) {
        buttons.push(
          <Button
            key={`page-${i}`}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            className="w-8 h-8"
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }
    } else {
      if (currentPage > 3) {
        buttons.push(
          <div key="ellipsis-1" className="mx-1">
            ...
          </div>
        );
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(
          <Button
            key={`page-${i}`}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            className="w-8 h-8"
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }

      if (currentPage < totalPages - 2) {
        buttons.push(
          <div key="ellipsis-2" className="mx-1">
            ...
          </div>
        );
      }
    }

    if (totalPages > 1) {
      buttons.push(
        <Button
          key={`page-${totalPages}`}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          className="w-8 h-8"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div
      className="flex items-center justify-center gap-1"
      data-testid="pagination"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        data-testid="pagination-prev"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {renderPageButtons()}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        data-testid="pagination-next"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
}
