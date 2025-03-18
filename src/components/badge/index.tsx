import useStyles from "./styles";
import classNames from "classnames";

interface BadgeProps {
  status: string | boolean;
}

const Badge: React.FC<BadgeProps> = ({ status }) => {
  const classes = useStyles({ status });

  const statusText =
    status === true ? "Verified" : 
    status === false ? "Rejected" : 
    status === "verified" ? "Verified" :
    status === "successful" ? "Successful" :
    status === "confirmed" ? "Confirmed" :
    status === "completed" ? "Completed" :
    status === "pending" ? "Pending" :
    status === "rejected" ? "Rejected" :
    status === "cancelled" ? "Cancelled" :
    status === "failed" ? "Failed" :
    "";

  return (
    <div className={classNames(classes.badgewrapper, classes.bg)}>
      {statusText}
    </div>
  );
};

export default Badge;
