import classNames from "classnames";

const Badge = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "rejected":
      case "cancelled":
      case "failed":
        return "text-red-600 bg-red-100";
      case "verified":
      case "successful":
      case "confirmed":
      case "completed":
        return "text-teal-700 bg-teal-100";
      case "pending":
        return "text-yellow-500 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Let first letter capitalized
  const formatStatus = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div
      className={classNames(
        "rounded-[10px] mt-[11px] w-[100px] h-[30px] text-xs flex items-center justify-center",
        "sm:min-w-[80px]",
        getStatusStyles(status)
      )}
    >
      {formatStatus(status)}
    </div>
  );
};

export default Badge;
