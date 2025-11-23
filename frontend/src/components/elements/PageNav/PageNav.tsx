import "./PageNav.css";

interface PageNavProps {
  page: number;
  size: number;
  onPageChange: (page: number) => void;
  ticketsAmount: number
}

export const PageNav = ({
  page,
  size,
  onPageChange,
  ticketsAmount
}: PageNavProps) => {
  return (
    <div className="page-nav-container">
        <button className="page-nav-button" onClick={() => onPageChange(page - 1)}>Back</button>
      
      <div className="page-nav-numbers">Page {page + 1} ({Math.min(size * page + 1, ticketsAmount)} - {Math.min(size * (page + 1), ticketsAmount)} of {ticketsAmount})</div>
      <button className="page-nav-button" onClick={() => onPageChange(page + 1)}>Next</button>
      
    </div>
  );
};
