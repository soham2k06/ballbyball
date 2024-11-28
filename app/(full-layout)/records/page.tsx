import { Metadata } from "next";

import RecordsList from "@/features/records/records-list";

export const metadata: Metadata = {
  title: "Records | Ballbyball",
  description: "Player records",
};

function RecordsPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Records
      </h1>
      <RecordsList />
    </div>
  );
}

export default RecordsPage;
