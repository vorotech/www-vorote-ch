import Layout from "@/components/layout/layout";
import OnCallScheduler from "@/components/tools/scheduler/scheduler-component";

export const metadata = {
    title: "On-Call Scheduler | Tools",
    description: "Generate on-call schedules.",
};

export default function SchedulerPage() {
    return (
        <Layout>
            <OnCallScheduler />
        </Layout>
    );
}
