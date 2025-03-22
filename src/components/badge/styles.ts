import { makeStyles } from "@mui/styles";
import tinycolor from "tinycolor2";

export default makeStyles(() => ({
  badgewrapper: {
    borderRadius: "10px",
    marginTop: "11px",
    width: 100,
    height: 30,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "@media (max-width: 430px)": {
      minWidth: 80
    },
    color: ({ status }: { status: string }) => {
      return(
          status === "rejected" ? "#FF0000" : 
          status === "cancelled" ? "#FF0000" : 
          status === "failed" ? "#FF0000" : 
          status === "verified" ? "#028090": 
          status === "successful" ? "#028090": 
          status === "confirmed" ? "#028090": 
          status === "completed" ? "#028090": 
          status === "pending" ? "#FFAE00" : "#667185"
      );
    },
    backgroundColor: ({ status }: { status: string }) => {
      return (
          status === "pending" ? tinycolor("#FFAE00").lighten(45).toHexString() :
          status === "verified" ? tinycolor("#028090").lighten(65).toHexString() :
          status === "confirmed" ? tinycolor("#028090").lighten(65).toHexString() :
          status === "completed" ? tinycolor("#028090").lighten(65).toHexString() :
          status === "successful" ? tinycolor("#124A52").lighten(65).toHexString() :
          status === "rejected" ? tinycolor("#FF0000").lighten(45).toHexString() : 
          status === "cancelled" ? tinycolor("#FF0000").lighten(45).toHexString() : 
          status === "failed" ? tinycolor("#FF0000").lighten(45).toHexString() : 
          tinycolor("#667185").lighten(45).toHexString()
      );
    }
  }
}));
