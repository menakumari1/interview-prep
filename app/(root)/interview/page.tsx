import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-7xl py-6">
      <Agent
        userName={user?.name!}
        userId={user?.id}
        type="generate"
      />
    </div>
  );
};

export default Page;
