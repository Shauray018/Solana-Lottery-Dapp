import Header from "@/components/common/Header";
import PotCard from "@/components/home/PotCard";
import HistoryTable from "@/components/home/HistoryTable";

export default function Home() {
  return (
    <div>
      <Header />
      <div className="w-full flex flex-col justify-center items-center">
        <PotCard />
        <HistoryTable />
      </div>
    </div>
  );
}
