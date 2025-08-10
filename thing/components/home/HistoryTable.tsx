"use client";

import { shortenPk } from "@/app/utils/helper";
import { useAppContext } from "@/context/context";

const TableRow = ({
  lotteryId,
  winnerAddress = "4koeNJ39zejjuCyVQdZmzsx28CfJoarrv4vmsuHjFSB6",
  winnerId,
  prize,
  index,
}) => {
  return (
    <tr>
      <th>{index + 1}</th>
      <td>#{lotteryId}</td>
      <td>{shortenPk(winnerAddress)}</td>
      <td>#{winnerId}</td>
      <td>+{prize} SOL</td>
    </tr>
  );
};

const HistoryTable = () => {
  const { lotteryHistory } = useAppContext();

  return (
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-200 mt-10 w-2/3 ">
      <table className="table">
        <thead className="bg-base-300">
          <tr>
            <th></th>
            <th>💳 Lottery</th>
            <th>💳 Address</th>
            <th>💳 Ticket</th>
            <th>💲 Amount</th>
          </tr>
        </thead>
        <tbody>
          {lotteryHistory?.map((h, i) => (
            <TableRow key={i} {...h} index={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;
