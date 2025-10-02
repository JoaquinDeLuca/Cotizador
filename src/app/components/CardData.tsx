import { Skeleton } from "antd";

interface CardProps {
  title: string;
  icon?: React.ReactNode;
  amount: string;
  percentage: number;
  currency: string;
  loading?: boolean;
}

const CardData: React.FC<CardProps> = ({
  title,
  amount,
  percentage,
  currency,
  loading = false,
  icon,
}) => {
  const isNegative = String(percentage).startsWith("-");
  const badgeClass = isNegative
    ? "bg-gray-100 text-gray-800"
    : "bg-accent-light text-accent";

  return (
    <div className="w-full max-w-[17rem] grow h-full max-h-[7rem] p-[1rem] bg-white rounded-xl shadow-lg duration-150 transition-all ease-linear hover:scale-110">
      {loading ? (
        <div className="flex flex-col gap-2 min-h-[7rem]">
          <Skeleton.Input
            active
            size="small"
            style={{ background: "#ebeff4" }}
          />
          <Skeleton.Input
            active
            size="default"
            style={{ background: "#ebeff4" }}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 max-h-[7rem]">
          <div className="mr-1">{icon && icon}</div>

          {/* <div className="flex items-center gap-3"></div> */}
          <div className="flex flex-col items-start gap-2 w-full">
            <p className="font-medium text-sm text-gray-500">{title}</p>
            <div className="flex items-center gap-1">
              <p className="text-xl font-bold text-gray-900">{amount}</p>
              {percentage > 0 && (
                <span
                  className={`text-[.7rem] font-medium px-2 py-1 rounded-full ${badgeClass}`}
                >
                  {percentage}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{currency}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardData;
