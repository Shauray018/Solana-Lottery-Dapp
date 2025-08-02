import Header from "@/components/common/Header";
import Image from "next/image";
import PotCard from "@/components/home/PotCard";

export default function Home() {
  return (
    <div>
      <Header />
      <div className="w-full flex justify-center items-center">
        <PotCard />
      </div>
    </div>
  );
}
